import Link from "next/link";
import { Activity } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";
export default function LoginPage() {
  return (
    <main className="login-layout">
      <section className="login-editorial">
        <Link href="/" className="brand">
          <span>
            <Activity size={24} />
          </span>
          pulse<span className="brand-dot">®</span>
        </Link>
        <div>
          <div className="eyebrow">A SPACE FOR YOUR CURIOSITY</div>
          <h2>
            Less noise.
            <br />
            <em>More you.</em>
          </h2>
          <p>
            The stories, sounds, and ideas worth making a little time for. All
            together, in a space that feels like yours.
          </p>
          <div className="login-art" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
        <footer>
          <span>Your world. Thoughtfully curated.</span>
          <span>P / 01</span>
        </footer>
      </section>
      <div className="login-form-area">
        <LoginForm />
      </div>
    </main>
  );
}
