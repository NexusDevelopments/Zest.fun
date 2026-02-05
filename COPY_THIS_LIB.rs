use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

declare_id!("YOUR_PROGRAM_ID_HERE");

const FEE_BPS: u64 = 200;
const BPS_DENOMINATOR: u64 = 10_000;

#[program]
pub mod zest {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, bonding_curve_constant: u64) -> Result<()> {
        let launchpad = &mut ctx.accounts.launchpad;
        launchpad.authority = ctx.accounts.authority.key();
        launchpad.treasury = ctx.accounts.treasury.key();
        launchpad.bonding_curve_constant = bonding_curve_constant;
        launchpad.total_supply = 0;
        launchpad.bump = ctx.bumps.launchpad;
        
        msg!("Launchpad initialized with bonding curve constant: {}", bonding_curve_constant);
        Ok(())
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let launchpad = &ctx.accounts.launchpad;
        let token_info = &mut ctx.accounts.token_info;
        
        if !user_account.has_claimed_free {
            require!(amount == 1, ErrorCode::FirstMintMustBeOne);
            
            let cpi_accounts = MintTo {
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.launchpad.to_account_info(),
            };
            
            let seeds = &[
                b"launchpad",
                &[launchpad.bump],
            ];
            let signer = &[&seeds[..]];
            
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            
            token::mint_to(cpi_ctx, 1)?;
            
            user_account.has_claimed_free = true;
            token_info.total_supply += 1;
            
            msg!("Free token minted to user: {}", ctx.accounts.user.key());
        } else {
            let current_supply = token_info.total_supply;
            let total_cost = calculate_bonding_curve_cost(
                token_info.bonding_curve_constant,
                current_supply,
                amount
            )?;
            
            msg!("Bonding curve cost for {} tokens: {} lamports", amount, total_cost);
            
            let fee_amount = total_cost
                .checked_mul(FEE_BPS)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(BPS_DENOMINATOR)
                .ok_or(ErrorCode::MathOverflow)?;

            let net_amount = total_cost
                .checked_sub(fee_amount)
                .ok_or(ErrorCode::MathOverflow)?;

            let fee_ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.treasury.key(),
                fee_amount,
            );

            anchor_lang::solana_program::program::invoke(
                &fee_ix,
                &[
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.treasury.to_account_info(),
                ],
            )?;

            let net_ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.launchpad.key(),
                net_amount,
            );

            anchor_lang::solana_program::program::invoke(
                &net_ix,
                &[
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.launchpad.to_account_info(),
                ],
            )?;
            
            let cpi_accounts = MintTo {
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.launchpad.to_account_info(),
            };
            
            let seeds = &[
                b"launchpad",
                &[launchpad.bump],
            ];
            let signer = &[&seeds[..]];
            
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            
            token::mint_to(cpi_ctx, amount)?;
            
            token_info.total_supply += amount;
            
            msg!("Minted {} tokens to user: {}", amount, ctx.accounts.user.key());
        }
        
        Ok(())
    }

    pub fn create_token(
        ctx: Context<CreateToken>,
        name: String,
        symbol: String,
        uri: String,
        bonding_curve_constant: u64,
    ) -> Result<()> {
        let launchpad = &ctx.accounts.launchpad;
        let token_info = &mut ctx.accounts.token_info;

        let mint_authority = ctx.accounts.token_mint.mint_authority;
        require!(
            mint_authority == COption::Some(launchpad.key()),
            ErrorCode::InvalidMintAuthority
        );

        token_info.creator = ctx.accounts.creator.key();
        token_info.mint = ctx.accounts.token_mint.key();
        token_info.name = name;
        token_info.symbol = symbol;
        token_info.uri = uri;
        token_info.bonding_curve_constant = bonding_curve_constant;
        token_info.total_supply = 0;
        token_info.created_at = Clock::get()?.unix_timestamp;

        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: ctx.accounts.launchpad.to_account_info(),
        };

        let seeds = &[b"launchpad", &[launchpad.bump]];
        let signer = &[&seeds[..]];

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::mint_to(cpi_ctx, 1)?;
        token_info.total_supply = 1;
        
        msg!("Token created: {} ({})", token_info.name, token_info.symbol);
        Ok(())
    }
}

fn calculate_bonding_curve_cost(
    constant: u64,
    current_supply: u64,
    amount: u64,
) -> Result<u64> {
    let mut total_cost: u64 = 0;
    
    for i in 0..amount {
        let new_supply = current_supply
            .checked_add(i)
            .ok_or(ErrorCode::MathOverflow)?;
        
        let supply_squared = (new_supply as u128)
            .checked_mul(new_supply as u128)
            .ok_or(ErrorCode::MathOverflow)?;
        
        let price = (constant as u128)
            .checked_mul(supply_squared)
            .ok_or(ErrorCode::MathOverflow)?;
        
        let price_scaled = price
            .checked_div(1_000_000)
            .ok_or(ErrorCode::MathOverflow)? as u64;
        
        total_cost = total_cost
            .checked_add(price_scaled)
            .ok_or(ErrorCode::MathOverflow)?;
    }
    
    Ok(total_cost)
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Launchpad::INIT_SPACE,
        seeds = [b"launchpad"],
        bump
    )]
    pub launchpad: Account<'info, Launchpad>,
    
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(
        mut,
        seeds = [b"launchpad"],
        bump = launchpad.bump
    )]
    pub launchpad: Account<'info, Launchpad>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"token_info", token_mint.key().as_ref()],
        bump
    )]
    pub token_info: Account<'info, TokenInfo>,
    
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, address = launchpad.treasury)]
    pub treasury: SystemAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(
        mut,
        seeds = [b"launchpad"],
        bump = launchpad.bump
    )]
    pub launchpad: Account<'info, Launchpad>,

    #[account(
        init,
        payer = creator,
        space = 8 + TokenInfo::INIT_SPACE,
        seeds = [b"token_info", token_mint.key().as_ref()],
        bump
    )]
    pub token_info: Account<'info, TokenInfo>,
    
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = token_mint,
        associated_token::authority = creator
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Launchpad {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub bonding_curve_constant: u64,
    pub total_supply: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub has_claimed_free: bool,
}

#[account]
#[derive(InitSpace)]
pub struct TokenInfo {
    pub creator: Pubkey,
    pub mint: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(10)]
    pub symbol: String,
    #[max_len(200)]
    pub uri: String,
    pub bonding_curve_constant: u64,
    pub total_supply: u64,
    pub created_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("First mint must be exactly 1 token")]
    FirstMintMustBeOne,
    #[msg("Math overflow occurred")]
    MathOverflow,
    #[msg("Mint authority must be the launchpad PDA")]
    InvalidMintAuthority,
}
