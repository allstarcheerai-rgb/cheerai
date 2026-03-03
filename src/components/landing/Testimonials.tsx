const TESTIMONIALS = [
  {
    quote:
      "Cheer AI saved us HOURS before competition season. Our Instagram went from sporadic posts to a full content calendar in one afternoon.",
    author: 'Coach Mia R.',
    gym: 'Voltage Athletics',
    avatar: 'MR',
    color: 'bg-pink-500',
  },
  {
    quote:
      "The Score Sheet Translator is a game changer. I finally understand what the judges mean by 'connection' and our team improved two full skill levels.",
    author: 'Coach Derek T.',
    gym: 'Apex All Stars',
    avatar: 'DT',
    color: 'bg-brand-600',
  },
  {
    quote:
      "As a gym owner, I was spending Sunday nights writing parent emails. Now I fill in the form, click generate, and I'm done in 5 minutes.",
    author: 'Samantha K.',
    gym: 'Elevate Cheer Co.',
    avatar: 'SK',
    color: 'bg-amber-500',
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Coaches love it
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Real feedback from real cheer coaches. (Placeholder — add your own!)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed text-sm mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold ${t.color}`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                  <p className="text-xs text-gray-500">{t.gym}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
