"use client";

/**
 * Generic Snapforest about section. Personal founder details and personal links are intentionally omitted.
 */
export default function FounderSection() {
  return (
    <section id="about-snapforest" className="bg-[#111111] section-padding" aria-label="About Snapforest">
      <div className="mx-auto max-w-4xl text-center">
        <p className="sf-label-forest mb-4">ABOUT SNAPFOREST</p>
        <h2 className="text-heading-lg text-white" style={{ fontFamily: "var(--font-primary)" }}>Creator spaces, made easy</h2>
        <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[#888888]">Snapforest helps creators discover and book spaces for podcasts, videos, photography, music and other creative projects.</p>
      </div>
    </section>
  );
}
