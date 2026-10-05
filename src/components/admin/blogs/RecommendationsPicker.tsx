"use client";

import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

import type { Option } from "@/lib/admin/editor";
import { buttonClass, iconButtonClass, selectClass } from "@/lib/admin/ui";

interface RecommendationsPickerProps {
  id: string;
  name: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  errors?: string[];
}

export default function RecommendationsPicker({
  id,
  name,
  options,
  value,
  onChange,
  max,
  errors,
}: RecommendationsPickerProps) {
  const [pending, setPending] = useState("");

  const optionById = new Map(options.map((option) => [option.id, option]));

  // Drops picks whose post was deleted since the page loaded
  const selected = value.flatMap((selectedId) => {
    const option = optionById.get(selectedId);
    return option ? [option] : [];
  });

  const available = options.filter((option) => !value.includes(option.id));
  const isFull = selected.length >= max;
  const error = errors?.[0];

  function add() {
    if (!pending || isFull) {
      return;
    }

    onChange([...selected.map((option) => option.id), pending]);
    setPending("");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    const ids = selected.map((option) => option.id);

    if (target < 0 || target >= ids.length) {
      return;
    }

    [ids[index], ids[target]] = [ids[target], ids[index]];
    onChange(ids);
  }

  function remove(removeId: string) {
    onChange(
      selected.map((option) => option.id).filter((item) => item !== removeId),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.length > 0 && (
        <ol className="flex flex-col gap-2">
          {selected.map((option, index) => (
            <li
              key={option.id}
              className="p-2 pl-3 flex items-center gap-2 bg-background border border-border rounded-lg"
            >
              <span className="w-5 shrink-0 text-xs font-medium text-accent">
                {index + 1}
              </span>

              <span className="min-w-0 flex-1 line-clamp-2 text-sm text-foreground">
                {option.label}
              </span>

              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${option.label} up`}
                className={iconButtonClass}
              >
                <ArrowUpIcon aria-hidden="true" className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === selected.length - 1}
                aria-label={`Move ${option.label} down`}
                className={iconButtonClass}
              >
                <ArrowDownIcon aria-hidden="true" className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => remove(option.id)}
                aria-label={`Remove ${option.label}`}
                className={iconButtonClass}
              >
                <XMarkIcon aria-hidden="true" className="w-4 h-4" />
              </button>

              <input type="hidden" name={name} value={option.id} />
            </li>
          ))}
        </ol>
      )}

      {!isFull && available.length > 0 && (
        <div className="flex gap-2">
          <label htmlFor={id} className="sr-only">
            Pick a post to recommend
          </label>

          <select
            id={id}
            value={pending}
            onChange={(event) => setPending(event.target.value)}
            className={selectClass}
          >
            <option value="">Pick a post</option>
            {available.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={add}
            disabled={!pending}
            className={buttonClass.secondary}
          >
            Add
          </button>
        </div>
      )}

      <p
        className={
          error ? "text-sm text-red-600" : "text-xs leading-5 text-muted"
        }
      >
        {error ??
          `Up to ${max}. Leave empty and posts with matching tags and category get picked automatically.`}
      </p>
    </div>
  );
}
