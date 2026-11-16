"use client";

import { TbHeart, TbHeartFilled } from "react-icons/tb";
import { useFavourite } from "@/lib/favourites";

/** Heart on the homepage lineup cards (outline → filled red when saved). */
export default function FavouriteButton({ id, name, className = "" }: { id: string; name: string; className?: string }) {
  const [saved, toggle] = useFavourite(id);
  return (
    <button
      type="button"
      aria-label={saved ? `Hiq ${name} nga të preferuarat` : `Ruaj ${name} në të preferuarat`}
      aria-pressed={saved}
      onClick={toggle}
      className={`flex size-11 items-center justify-center rounded-full transition-colors ${saved ? "bg-red" : "bg-black/55 hover:bg-red"} ${className}`}
    >
      {saved ? <TbHeartFilled size={18} aria-hidden /> : <TbHeart size={18} aria-hidden />}
    </button>
  );
}
