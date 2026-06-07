"use client";
import Image from "next/image";

export default function AdminHeader({ action }: { action?: React.ReactNode }) {
  return (
    <div className="bg-white sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
          {/*<span className="text-[7px] font-bold text-black text-center leading-tight">SAHERA PAK KIRNO</span>*/}
          <Image
            src="/kirno_logo_512.png"
            alt="Logo"
            width={512}
            height={512}
          />
        </div>
        <span className="text-black text-xl font-bold">Admin</span>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
