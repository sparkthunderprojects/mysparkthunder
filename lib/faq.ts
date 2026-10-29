export interface FaqItem {
  question: string;
  answer: string;
}

/** Used by the help page and by its FAQPage structured data. */
export const FAQ: FaqItem[] = [
  {
    question: 'What is a MySparkthunder account?',
    answer:
      'It is one account that works across every Sparkthunder universe. You create it once, then use the same email and password on each universe you join.',
  },
  {
    question: 'Which sites does it work on?',
    answer:
      'Every Sparkthunder universe. Knightverge is open now, and each new universe will use the same account. The universes page lists them all.',
  },
  {
    question: 'Do I sign in separately on each site?',
    answer:
      'Yes. Each universe has its own sign-in page so you never have to leave the site you are on. Use the same email and password everywhere.',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Choose "Forgot password" on any sign-in page and enter your email. We send you a link to choose a new password. If you are already signed in, you can change it under Security in your account.',
  },
  {
    question: 'How do I change my email address or password?',
    answer:
      'Sign in at mysparkthunder.com, open your account and choose Security. Changing your email sends a confirmation link to the new address.',
  },
  {
    question: 'Are my favourites shared between universes?',
    answer:
      'No. Each universe is separate, so your favourites and reading history stay with the universe they belong to. Your account page shows them in separate sections.',
  },
  {
    question: 'Where do I see my Sparkthunder Shop orders?',
    answer:
      'When the Sparkthunder Shop opens, your orders and wish list will appear under Orders and Wish list in your account.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Open your account, choose Security and select "Request account deletion". Deleting your account removes it from every Sparkthunder site, not just one.',
  },
  {
    question: 'Who can see my favourites and reading history?',
    answer:
      'Only you can see them. Sparkthunder staff can see account details and activity totals when they are helping you with a support request.',
  },
];
