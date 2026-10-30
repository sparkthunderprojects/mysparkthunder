import { ButtonLink } from '@/components/ui';

/** The line under the hero: what MySparkthunder is, and the two ways in. */
export default function AccountIntro() {
  return (
    <section aria-labelledby="intro-heading" className="px-5 py-24 text-center sm:px-8 sm:py-32">
      <h2
        id="intro-heading"
        className="title-lit mx-auto max-w-4xl text-[clamp(2.2rem,5.2vw,4.4rem)] font-black uppercase leading-[0.95]"
      >
        One account. Every universe.
      </h2>
      <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-bone/85 sm:text-xl sm:leading-relaxed">
        MySparkthunder is the account behind every Sparkthunder universe. Sign in once to save your favourites,
        keep your reading history and manage your details in one place.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/signup">Create your account</ButtonLink>
        <ButtonLink href="/login" variant="secondary">
          Sign in
        </ButtonLink>
      </div>
    </section>
  );
}
