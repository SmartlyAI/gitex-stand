"use client";

import React, { useState } from "react";
import { Toolbar } from "./Toolbar";
import { FurnitureSidebar } from "./FurnitureSidebar";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { ShareModal } from "./ShareModal";

export function StandEditor() {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar onShareOpen={() => setShareOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <FurnitureSidebar />
        <Canvas />
        <PropertiesPanel />
      </div>
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
