'use client';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkle, Check, ChevronsUpDown, XCircle, PlusCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

import { CATEGORIES } from '@/constants/categories';

const CHAPTER_OPTIONS = [
  { label: "3 Chapters (Not Complex)", value: 3 },
  { label: "6 Chapters (Average Detail)", value: 6 },
  { label: "10 Chapters (Detailed Course)", value: 10 },
  { label: "Other (Enter Manually)", value: "other" },
];

function AddCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chapters: 0,
    includeVideo: false,
    difficulty: "",
    category: "",
  });

  const [selectedChapterOption, setSelectedChapterOption] = useState('');
  const [customChapters, setCustomChapters] = useState('');

  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [categoryInputSearch, setCategoryInputSearch] = useState('');
  
  const [selectedCategories, setSelectedCategories] = useState([]);

  const isSearchMatchingExistingCategory = useMemo(() => {
    return CATEGORIES.some(cat =>
      cat.toLowerCase() === categoryInputSearch.toLowerCase().trim()
    );
  }, [categoryInputSearch]);

  useEffect(() => {
    let chaptersNum = 0;
    if (selectedChapterOption === 'other') {
      chaptersNum = parseInt(customChapters, 10);
      chaptersNum = isNaN(chaptersNum) ? 0 : chaptersNum;
    } else if (selectedChapterOption) {
      chaptersNum = parseInt(selectedChapterOption, 10);
    }
    setFormData((prev) => ({ ...prev, chapters: chaptersNum }));
  }, [selectedChapterOption, customChapters]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, category: selectedCategories.join(', ') }));
  }, [selectedCategories]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCategorySelect = useCallback((categoryValue) => {
    setSelectedCategories((currentCategories) => {
      const newCategories = new Set(currentCategories);
      if (newCategories.has(categoryValue)) {
        newCategories.delete(categoryValue);
      } else {
        newCategories.add(categoryValue);
      }
      return Array.from(newCategories);
    });
    setCategoryInputSearch('');
  }, []);

  // --- FIXED: Simplified the remove handler to prevent potential stale state issues ---
  const handleRemoveCategory = (categoryToRemove) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.filter((c) => c !== categoryToRemove)
    );
  };

  const onGenerateCourse = async () => {
    if (!formData.name || formData.chapters <= 0 || !formData.difficulty || selectedCategories.length === 0) {
      toast.error("Please fill in all required fields!", {
        description: "Course Name, Chapters, Difficulty, and at least one Category are required.",
        duration: 3000,
      });
      return;
    }

    const courseId = uuidv4();
    try {
      setLoading(true);
      const result = await axios.post("/api/generate-course-layout", {
        ...formData,
        courseId,
      });
      router.push("/workspace/edit-course/" + result.data?.courseId);
    } catch (error) {
      toast.error("Failed to generate course.", {
        description: "An error occurred. Please try again.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      chapters: 0,
      includeVideo: false,
      difficulty: "",
      category: "",
    });
    setSelectedChapterOption('');
    setCustomChapters('');
    setCategoryInputSearch('');
    setSelectedCategories([]);
  }, []);

  useEffect(() => {
    if (!isDialogOpen) {
      resetFormState();
    }
  }, [isDialogOpen, resetFormState]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {isDialogOpen && (
        <DialogContent className="
          backdrop-blur-md bg-[var(--card)]/90 border border-[var(--border)] shadow-2xl
          rounded-2xl p-6 text-[var(--foreground)]
          w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto
        ">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-[var(--foreground)] mb-2">
              Generate New Course
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-col gap-6 mt-4 text-sm text-[var(--muted-foreground)]">
                {/* --- Forms sections (no changes) --- */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Course Name</label>
                  <Input
                    placeholder="e.g., 'Introduction to Quantum Physics'"
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    value={formData.name}
                    className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Course Description (optional)</label>
                  <Textarea
                    placeholder="Provide a brief description of the course."
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    value={formData.description}
                    className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Number of Chapters</label>
                  <Select onValueChange={(value) => {
                    setSelectedChapterOption(value);
                    if (value !== 'other') setCustomChapters('');
                  }} value={selectedChapterOption} required>
                    <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                      <SelectValue placeholder="Select number of chapters" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                      {CHAPTER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)} className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedChapterOption === 'other' && (
                    <Input
                      type="number"
                      placeholder="Enter custom number of chapters"
                      value={customChapters}
                      onChange={(e) => setCustomChapters(e.target.value)}
                      className="mt-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                      min="1"
                      required
                    />
                  )}
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="font-medium text-[var(--foreground)]">Include video lessons?</label>
                  <Switch
                    checked={formData.includeVideo}
                    onCheckedChange={(checked) => handleInputChange("includeVideo", checked)}
                    className="data-[state=unchecked]:bg-[var(--muted-foreground)] data-[state=checked]:bg-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Difficulty Level</label>
                  <Select onValueChange={(val) => handleInputChange("difficulty", val)} value={formData.difficulty} required>
                    <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                      <SelectItem value="beginner" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* --- Category Combobox Section --- */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Category (select multiple or type custom)</label>
                  <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCategoryCombobox}
                        className="w-full justify-between bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--input)]/80 focus:ring-[var(--ring)] focus:border-[var(--primary)] min-h-[40px] flex-wrap h-auto"
                      >
                        <div className="flex flex-wrap gap-1">
                          {selectedCategories.length > 0 ? (
                            selectedCategories.map((category) => (
                              <span
                                key={category}
                                className="flex items-center gap-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-2 py-0.5 text-xs"
                              >
                                {category}
                                <button
                                  type="button"
                                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--primary)] focus:ring-[var(--primary-foreground)]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCategory(category);
                                  }}
                                >
                                  <XCircle className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" />
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-[var(--muted-foreground)]">Select or add categories...</span>
                          )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                      <Command className="bg-[var(--popover)]">
                        <CommandInput
                          placeholder="Search or add category..."
                          value={categoryInputSearch}
                          onValueChange={setCategoryInputSearch}
                          className="h-9 bg-[var(--input)] border-b border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                        />
                        <CommandEmpty className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                          No category found. Type to add a custom one.
                        </CommandEmpty>
                        <CommandList 
                          // --- FIXED: This stops the scroll event from bubbling up to the dialog ---
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <CommandGroup>
                            {CATEGORIES.map((category) => (
                              <CommandItem
                                key={category}
                                value={category}
                                onSelect={() => handleCategorySelect(category)}
                                className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCategories.includes(category) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {category}
                              </CommandItem>
                            ))}
                            {categoryInputSearch.trim() && !isSearchMatchingExistingCategory && !selectedCategories.includes(categoryInputSearch.trim()) && (
                              <CommandItem
                                key={`custom-add-${categoryInputSearch.trim()}`}
                                value={categoryInputSearch.trim()}
                                onSelect={() => handleCategorySelect(categoryInputSearch.trim())}
                                className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer font-semibold text-[var(--primary)] mt-1"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add "{categoryInputSearch.trim()}"
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* --- Generate Course Button --- */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={onGenerateCourse}
                    disabled={loading || !formData.name || formData.chapters <= 0 || !formData.difficulty || selectedCategories.length === 0}
                    className="btn-primary gap-2 !text-base !h-12 !px-6"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkle className="w-5 h-5" />
                    )}
                    {loading ? "Generating..." : "Generate Course"}
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default AddCourseDialog;