import React from "react";
import {
  BanIcon,
  BoxSelect,
  Circle,
  EraserIcon,
  PenIcon,
  RectangleHorizontal,
  SlashIcon,
  TypeOutline,
} from "lucide-react";

export const ToolArray = [
  {
    name: "None",
    icon: BanIcon,
    type: 0,
  },
  {
    name: "Pen",
    icon: PenIcon,
    type: 1,
  },
  {
    name: "Text",
    icon: TypeOutline,
    type: 2,
  },
  {
    name: "Line",
    icon: SlashIcon,
    type: 4,
  },
  {
    name: "Rect",
    icon: RectangleHorizontal,
    type: 8,
  },
  {
    name: "Ellipse",
    icon: Circle,
    type: 16,
  },
  {
    name: "Selector",
    icon: BoxSelect,
    type: 32,
  },
  {
    name: "Eraser",
    icon: EraserIcon,
    type: 64,
  },
];
