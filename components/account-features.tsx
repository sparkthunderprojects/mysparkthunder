import type { ReactNode } from 'react';
import { Compass, Heart, Lock, LogIn, ShoppingBag, UserRound } from 'lucide-react';
import { ButtonLink } from '@/components/ui';

const FEATURES: { name: string; text: string; icon: ReactNode }[] = [
  {
    name: 'Account management',
    text: 'Update your display name, picture and email address in one place.',
    icon: <UserRound className="h-9 w-9" aria-hidden="true" strokeWidth={1.5} />,
  },
  {
    name: 'Access and security',
    text: 'Choose a strong password, change it whenever you like, or delete your account if you ever want to.',
    icon: <Lock className="h-9 w-9" aria-hidden="true" strokeWidth={1.5} />,
  },
  {
    name: 'Sign in across Sparkthunder',
    text: 'Use Sign in with My Sparkthunder on every connected site, without making a new account each time.',
    icon: <LogIn className="h-9 w-9" aria-hidden="true" strokeWidth={1.5} />,
  },
  {
    name: 'Favourites and reading history',
    text: 'Save characters, comics and places, and pick up where you left off. Each universe is kept separate.',
    icon: <Heart className="h-9 w-9" aria-hidden="true" strokeWidth={1.5} />,
  },
  {
    name: 'Wish list and orders',
    text: 'Keep track of Sparkthunder Shop products you want, and see your orders together in one place.',
    icon: <ShoppingBag className="h-9 w-9" aria-hidden="true" strokeWidth={1.5} />,
  },
  {
    name: 'Your universes',
    text: 'See every universe you have joined, and collect badges as you explore them.',
    icon: <Compass className="h-9 w-9" aria-hidden="true" strokeWidth={1.5} />,
  },
];

/** "What can you do with a MySparkthunder account?" card grid for the home page. */
export default function AccountFeatures() {
  return (
    <section aria-labelledby="holds-heading" className="border-y border-line bg-gradient-to-b from-panel to-ink">
      <div className="w-full px-5 py-24 sm:px-8 lg:px-14">
        <h2
          id="holds-heading"
          className="mx-auto max-w-3xl text-center text-4xl font-black uppercase leading-[0.95] sm:text-6xl"
        >
          What can you do with a MySparkthunder account?
        </h2>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <li key={item.name} className="poster-wrap">
              <div className="frame h-full">
                <div className="frame-in h-full bg-panel/70 p-7">
                  <span className="text-volt">{item.icon}</span>
                  <h3 className="mt-5 text-2xl font-extrabold">{item.name}</h3>
                  <p className="mt-2 leading-relaxed text-dim">{item.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/signup">Create your account</ButtonLink>
          <ButtonLink href="/sites" variant="secondary">
            See where you can sign in
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
