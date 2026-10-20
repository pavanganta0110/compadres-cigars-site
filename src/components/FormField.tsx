// Shared styling for the light "Become a Customer" / checkout forms: white page, Times serif, bordered
// floating-label fields (matches the original Elfsight form).
export const serif = "font-[Times,'Times_New_Roman',serif] text-[15px] text-[#111]";

export function Field({ name, label, required, type = "text", half, textarea }: { name: string; label: string; required?: boolean; type?: string; half?: boolean; textarea?: boolean }) {
  const control =
    "peer absolute inset-x-[15px] bottom-[8px] bg-transparent text-[15px] text-[#111] outline-none placeholder:text-transparent";
  return (
    <div className={`relative rounded border border-[#111]/20 focus-within:border-[#197bff] ${half ? "" : "col-span-2"} ${textarea ? "h-[92px]" : "h-[52px]"}`}>
      {textarea ? (
        <textarea id={name} name={name} required={required} maxLength={4000} placeholder=" " className={`${control} h-[60px] resize-none`} />
      ) : (
        <input id={name} name={name} type={type} required={required} maxLength={500} placeholder=" " className={`${control} h-5`} />
      )}
      <label
        htmlFor={name}
        className="pointer-events-none absolute left-[15px] top-[15px] origin-left text-[15px] font-bold text-[#111]/50 transition-all peer-focus:top-[4px] peer-focus:text-[11px] peer-not-placeholder-shown:top-[4px] peer-not-placeholder-shown:text-[11px]"
      >
        {label}
        {required && " *"}
      </label>
    </div>
  );
}
