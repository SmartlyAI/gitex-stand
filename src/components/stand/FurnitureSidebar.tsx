"use client";

import React, { useState } from "react";
import { catalog } from "@/lib/catalog";
import { FurnitureCatalogItem } from "@/lib/types";
import { useStandStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Search,
} from "lucide-react";

export function FurnitureSidebar() {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const addElement = useStandStore((s) => s.addElement);
  const isReadOnly = useStandStore((s) => s.isReadOnly);

  const toggleCategory = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (
    e: React.DragEvent,
    item: FurnitureCatalogItem
  ) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
  };

  const filteredCatalog = catalog
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="w-60 min-h-0 border-r border-[#e5e7eb] bg-white flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-[#e5e7eb]">
        <h2 className="font-semibold text-[13px] text-[#1e293b] mb-2.5">Mobilier</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94a3b8]" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-[12px] bg-[#f8f9fb] border-[#e5e7eb] rounded-lg placeholder:text-[#b0b8c4]"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
          {filteredCatalog.map((cat) => (
            <div key={cat.id} className="mb-0.5">
              <button
                className="flex items-center gap-1.5 w-full text-left py-2 px-1 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider hover:text-[#334155] transition-colors"
                onClick={() => toggleCategory(cat.id)}
              >
                {collapsed[cat.id] ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {cat.label}
              </button>

              {!collapsed[cat.id] && (
                <div className="space-y-px pb-1">
                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg group transition-colors ${
                        isReadOnly
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-[#f1f5f9] cursor-grab active:cursor-grabbing"
                      }`}
                      draggable={!isReadOnly}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDoubleClick={() => {
                        if (!isReadOnly) {
                          addElement(item);
                        }
                      }}
                    >
                      <GripVertical className="h-3.5 w-3.5 text-[#cbd5e1] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      <div
                        className="w-6 h-6 rounded flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[12px] text-[#334155] truncate leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#94a3b8] mt-0.5">
                          {item.width}×{item.height}m
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
