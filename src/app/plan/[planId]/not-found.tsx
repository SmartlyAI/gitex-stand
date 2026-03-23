export default function PlanNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-6">
      <div className="max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm text-center">
        <h1 className="text-xl font-semibold text-[#1e293b]">Plan introuvable</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          Ce lien de partage est invalide ou le plan n&apos;existe plus.
        </p>
      </div>
    </div>
  );
}
