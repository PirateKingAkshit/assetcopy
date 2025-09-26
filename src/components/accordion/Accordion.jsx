

"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

// Main Accordion wrapper
function Accordion({ children, className = "", ...props }) {
  return (
    <AccordionPrimitive.Root
      className={`w-full divide-y divide-gray-200 border border-gray-200 rounded-md bg-white ${className}`}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

// Accordion item
function AccordionItem({ className = "", children, ...props }) {
  return (
    <AccordionPrimitive.Item
      className={`border-b last:border-b-0 ${className}`}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  );
}

// Accordion trigger (header)
function AccordionTrigger({ className = "", children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={`flex flex-1 items-center justify-between py-4 px-4 text-left text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors [&[data-state=open]>svg]:rotate-180 ${className}`}
        {...props}
      >
        {children}
        <ChevronDownIcon className="w-5 h-5 text-gray-500 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// Accordion content (body)
function AccordionContent({ className = "", children, ...props }) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm text-gray-700 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
      {...props}
    >
      <div className={`px-4 pb-4 ${className}`}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
