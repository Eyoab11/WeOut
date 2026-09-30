import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  Footprints,
  MapPin,
  Mountain,
  Sparkles,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";
export default function Landing() {
  return (
    <>
      <header className="landing-nav wrap">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#discover">Discover</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/companions">Our kind of people</Link>
        </nav>
        <div className="nav-actions">
          <Link className="text-link login-link" href="/login">
            Log in
          </Link>
          <Link className="button small" href="/signup">
            Get out there <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="live-dot" /> PLACES. PEOPLE. PURPOSE.
            </span>
            <h1>
              Less scrolling.
              <br />
              More <span className="serif">living.</span>
            </h1>
            <p>
              Your next great story starts outside. Find unexpected places,
              little adventures, and people to share them with.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/home">
                Find your next adventure <ArrowUpRight size={19} />
              </Link>
              <a className="text-link" href="#how-it-works">
                Meet WeOut <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-note">
              <div className="avatar-stack">
                {[1, 2, 3].map((n) => (
                  <Image
                    key={n}
                    src={`/images/traveler-${n}.jpg`}
                    width={38}
                    height={38}
                    alt=""
                  />
                ))}
              </div>
              <span>
                For the curious. The spontaneous.
                <br />
                <strong>The “let’s see where this goes” people.</strong>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/hiker.jpg"
              alt="Hikers taking the scenic trail through a green mountain valley"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 52vw"
              className="cover"
            />
            <div className="hero-image-shade" />
            <span className="photo-label">
              <MapPin size={14} /> Somewhere outside your routine
            </span>
            <div className="hero-image-title">
              Take the long way.
              <br />
              <em>It’s worth it.</em>
            </div>
            <div className="floating-quest">
              <span className="quest-icon">
                <Mountain size={23} />
              </span>
              <div>
                <span className="eyebrow">YOUR NEXT SIDEQUEST</span>
                <strong>Chase a new perspective</strong>
                <span>One trail. A whole new feeling.</span>
              </div>
              <Link href="/sidequests" aria-label="Discover SideQuests">
                <ArrowUpRight size={22} />
              </Link>
            </div>
            <span className="vertical-caption">
              GO A LITTLE FURTHER · FEEL A LITTLE MORE
            </span>
          </div>
        </section>
        <div className="values-strip">
          <div className="wrap">
            <span>
              <Compass /> Follow your curiosity
            </span>
            <span>
              <Footprints /> Make everyday an adventure
            </span>
            <span>
              <Users /> Find your kind of people
            </span>
            <span>
              <Mountain /> Leave a lighter footprint
            </span>
          </div>
        </div>
        <section id="discover" className="section wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                A LITTLE CURIOSITY GOES A LONG WAY
              </span>
              <h2>
                Out there is <span className="serif">your kind of place.</span>
              </h2>
            </div>
            <Link className="text-link" href="/explore">
              Explore the possibilities <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="destination-grid">
            {[
              {
                image: "coast",
                tag: "TAKE THE SCENIC ROUTE",
                title: "Find your hidden gem",
                text: "The best places aren’t always on the list.",
                href: "/home",
              },
              {
                image: "food",
                tag: "TASTE SOMETHING NEW",
                title: "Follow the local flavor",
                text: "A new favorite is just around the corner.",
                href: "/explore",
              },
              {
                image: "mountains",
                tag: "MAKE ROOM FOR WONDER",
                title: "A little further. A little freer.",
                text: "Trade your usual view for something wild.",
                href: "/sidequests",
              },
            ].map((item) => (
              <Link
                className="destination-card"
                key={item.image}
                href={item.href}
              >
                <div className="destination-image">
                  <Image
                    src={`/images/${item.image}.jpg`}
                    alt={item.title}
                    fill
                    sizes="(max-width: 760px) 90vw, 33vw"
                    className="cover"
                  />
                  <span className="image-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
                <span className="eyebrow">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        </section>
        <section id="how-it-works" className="how-section">
          <div className="wrap how-grid">
            <div>
              <span className="eyebrow">BIG MEMORIES. SMALL BEGINNINGS.</span>
              <h2>
                You don’t need
                <br />a big plan.
                <br />
                <span className="serif">Just a little nudge.</span>
              </h2>
              <p>
                WeOut turns “we should do something” into a story you’ll tell
                later. Start close to home. See where it takes you.
              </p>
              <Link className="button" href="/sidequests">
                Pick a SideQuest <Sparkles size={17} />
              </Link>
            </div>
            <div className="steps">
              {[
                {
                  title: "Find what’s around you",
                  body: "Hidden corners, local flavors, and a different way to see familiar places.",
                  icon: Compass,
                },
                {
                  title: "Say yes to a little adventure",
                  body: "Pick a SideQuest, head outside, and capture the moment in a photo.",
                  icon: Mountain,
                },
                {
                  title: "Make it better together",
                  body: "Plan a trip and discover travelers who share your curiosity.",
                  icon: Users,
                },
              ].map((step, i) => (
                <div className="step" key={step.title}>
                  <span className="step-number">0{i + 1}</span>
                  <div>
                    <step.icon size={24} />
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="final-cta wrap">
          <span className="eyebrow">YOUR WORLD IS BIGGER THAN YOUR FEED</span>
          <h2>
            So… <span className="serif">we out?</span>
          </h2>
          <p>Good places. Good people. A good reason to go.</p>
          <Link className="button" href="/home">
            Let’s see what’s out there <ArrowUpRight size={18} />
          </Link>
          <span className="small-note">
            Take a look around. No account needed to explore.
          </span>
        </section>
      </main>
      <footer className="footer wrap">
        <Brand />
        <p>Go out. Explore more. Together.</p>
        <div>
          <Link href="/explore">Explore</Link>
          <Link href="/login">Log in</Link>
          <span>© {new Date().getFullYear()} WeOut</span>
        </div>
      </footer>
    </>
  );
}
