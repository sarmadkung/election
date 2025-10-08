use anchor_lang::prelude::*;

declare_id!("FebkUJTM4q6mfJopjHxGGrfkCuBBeeZG7vtVTkoer1Kb");

#[program]
pub mod election {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn initialize_poll(ctx: Context<InitializePoll>, poll_id: u64, description: String, poll_start_date: u64, poll_end_date: u64, candidates_amount: u64) -> Result<()> {
        msg!("Poll ID: {:?}", poll_id);
        msg!("Greetings from: {:?}", ctx.program_id);
        ctx.accounts.poll.poll_id = poll_id;
        ctx.accounts.poll.description = description;
        ctx.accounts.poll.poll_start_date = poll_start_date;
        ctx.accounts.poll.poll_end_date = poll_end_date;
        ctx.accounts.poll.candidates_amount = candidates_amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init, 
        payer = signer, 
        space = 8 + Poll::INIT_SPACE, 
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
     )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(280)]
    pub description: String,
    pub poll_start_date: u64,
    pub poll_end_date: u64,
    pub candidates_amount: u64,
}