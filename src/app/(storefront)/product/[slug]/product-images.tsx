"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductImages({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const displayImages = images.length > 0 ? images : ["/placeholder-product.svg"];

  return (
    <div>
      <div key={selected} className="product-main-image relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={displayImages[selected]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {displayImages.length > 1 && (
        <div className="mt-4 flex gap-2">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                i === selected ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
