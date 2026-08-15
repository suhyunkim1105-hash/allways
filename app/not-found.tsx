import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">The path you followed doesn&apos;t exist — let&apos;s get you back on an accessible one.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-brand px-8 py-3 font-bold text-white">Go home</Link>
    </div>
  );
}
