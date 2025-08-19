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
import { Loader2, Sparkle, Check, ChevronsUpDown, XCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

// --- Import CATEGORIES from external file ---
import { CATEGORIES } from '@/constants/categories';

// Define suggested chapter options
const CHAPTER_OPTIONS = [
  { label: "3 Chapters (Not Complex)", value: 3 },
  { label: "6 Chapters (Average Detail)", value: 6 },
  { label: "10 Chapters (Detailed Course)", value: 10 },
  { label: "Other (Enter Manually)", value: "other" },
];

function AddCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- NEW: Control Dialog open state explicitly ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chapters: 0,
    includeVideo: false,
    difficulty: "",
    category: "",
  });

  // State for chapter selection
  const [selectedChapterOption, setSelectedChapterOption] = useState('');
  const [customChapters, setCustomChapters] = useState('');

  // State for category combobox
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [categoryInputSearch, setCategoryInputSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategoryValue, setCustomCategoryValue] = useState('');

  // --- OPTIMIZATION 1: Memoize filtered categories for Command component ---
  // This reduces the number of CommandItem components React has to re-render
  // when you type in the search input.
  const filteredCategories = useMemo(() => {
    if (!categoryInputSearch) {
      return CATEGORIES;
    }
    const lowercasedSearch = categoryInputSearch.toLowerCase().trim();
    return CATEGORIES.filter(cat =>
      cat.toLowerCase().includes(lowercasedSearch)
    );
  }, [categoryInputSearch]);

  // Memoize this check as well
  const isSearchMatchingExistingCategory = useMemo(() => {
    return CATEGORIES.some(cat =>
      cat.toLowerCase() === categoryInputSearch.toLowerCase().trim()
    );
  }, [categoryInputSearch]);

  // Effect to update formData.chapters
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

  // Effect to update formData.category from selectedCategories and customCategoryValue
  useEffect(() => {
    let allCategories = [...selectedCategories];
    const trimmedCustom = customCategoryValue.trim();
    if (trimmedCustom && !allCategories.includes(trimmedCustom)) {
      allCategories.push(trimmedCustom);
    }
    setFormData((prev) => ({ ...prev, category: allCategories.join(', ') }));
  }, [selectedCategories, customCategoryValue]);

  // Memoized input change handler (remains the same, already good)
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Memoized category selection handler (remains the same, already good)
  const handleCategorySelect = useCallback((categoryValue) => {
    if (CATEGORIES.includes(categoryValue)) {
      setCustomCategoryValue('');
      setSelectedCategories((prevSelected) => {
        const isSelected = prevSelected.includes(categoryValue);
        if (isSelected) {
          return prevSelected.filter((c) => c !== categoryValue);
        } else {
          return [...prevSelected, categoryValue];
        }
      });
      setCategoryInputSearch('');
      setOpenCategoryCombobox(false);
    } else {
      setCustomCategoryValue(categoryValue);
      setSelectedCategories([]);
      setOpenCategoryCombobox(false);
      setCategoryInputSearch('');
    }
  }, []);

  // Memoized category removal handler (remains the same, already good)
  const handleRemoveCategory = useCallback((categoryToRemove) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.filter((c) => c !== categoryToRemove)
    );
    if (customCategoryValue === categoryToRemove) {
      setCustomCategoryValue('');
    }
  }, [selectedCategories, customCategoryValue]);

  const onGenerateCourse = async () => {
    const finalCategory = formData.category.trim();
    if (!formData.name || formData.chapters <= 0 || !formData.difficulty || !finalCategory) {
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
      console.error("Error generating course:", error);
      toast.error("Failed to generate course.", {
        description: "An error occurred. Please try again.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- NEW OPTIMIZATION 2: Reset form state when dialog closes ---
  // This is crucial. When the dialog is closed, it unmounts and remounts
  // when opened again, ensuring a fresh state and preventing stale data
  // or accumulation of performance issues from previous interactions.
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
    setCustomCategoryValue('');
  }, []); // Dependencies are stable (set functions)

  // Use the dialog's open state to reset form when it closes
  useEffect(() => {
    // Only reset if the dialog is closing
    if (!isDialogOpen) {
      resetFormState();
    }
  }, [isDialogOpen, resetFormState]);


  return (
    // --- NEW OPTIMIZATION 3: Conditionally render DialogContent ---
    // The Dialog component itself should manage its `open` state.
    // We pass `isDialogOpen` to the `Dialog` component directly.
    // The `DialogContent` is then only rendered when `isDialogOpen` is true.
    // This means all inputs, selects, and comboboxes are completely unmounted
    // from the DOM when the dialog is closed, and re-mounted fresh when opened.
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {isDialogOpen && ( // Only render DialogContent if dialog is open
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
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Course Name</label>
                  <Input
                    placeholder="Enter course name, e.g., 'Introduction to Quantum Physics'"
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    value={formData.name} // IMPORTANT: Make inputs controlled
                    className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Course Description (optional)</label>
                  <Textarea
                    placeholder="Provide a brief description of what the course will cover."
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    value={formData.description} // IMPORTANT: Make inputs controlled
                    className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                  />
                </div>

                {/* Number of Chapters - Dropdown with "Other" input */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Number of Chapters</label>
                  <Select onValueChange={(value) => {
                    setSelectedChapterOption(value);
                    if (value !== 'other') {
                      setCustomChapters('');
                    }
                  }} value={selectedChapterOption} required>
                    <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                      <SelectValue placeholder="Select number of chapters" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                      {CHAPTER_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedChapterOption === 'other' && (
                    <Input
                      type="number"
                      placeholder="Enter custom number of chapters"
                      value={customChapters} // IMPORTANT: Make inputs controlled
                      onChange={(e) => setCustomChapters(e.target.value)}
                      className="mt-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                      min="1"
                      required
                    />
                  )}
                </div>

                {/* Include Video Lessons - Switch with improved neutral state */}
                <div className="flex items-center justify-between py-2">
                  <label className="font-medium text-[var(--foreground)]">Include video lessons?</label>
                  <Switch
                    checked={formData.includeVideo}
                    onCheckedChange={(checked) => handleInputChange("includeVideo", checked)}
                    className="data-[state=unchecked]:bg-[var(--muted-foreground)] data-[state=checked]:bg-[var(--primary)]"
                  />
                </div>

                {/* Difficulty Level */}
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

                {/* Category - Searchable Combobox with Multi-Select and "Other" input */}
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
                                className="flex items-center gap-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-2 py-0.5 text-xs"
                              >
                                {category}
                                <XCircle
                                  className="w-3 h-3 cursor-pointer hover:text-[var(--destructive)]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCategory(category);
                                  }}
                                />
                              </span>
                            ))
                          ) : customCategoryValue.trim() ? (
                            <span className="flex items-center gap-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-2 py-0.5 text-xs">
                              {customCategoryValue} (Custom)
                              <XCircle
                                className="w-3 h-3 cursor-pointer hover:text-[var(--destructive)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomCategoryValue('');
                                }}
                              />
                            </span>
                          ) : (
                            <span className="text-[var(--muted-foreground)]">Select category(s)...</span>
                          )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)] max-h-60 overflow-y-auto">
                      <Command className="bg-[var(--popover)]">
                        <CommandInput
                          placeholder="Search category..."
                          value={categoryInputSearch}
                          onValueChange={setCategoryInputSearch}
                          className="h-9 bg-[var(--input)] border-b border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                        />
                        <CommandEmpty className="py-4 text-center text-[var(--muted-foreground)]">No category found.</CommandEmpty>
                        <CommandGroup className="max-h-[calc(var(--radix-popover-content-available-height) - 40px)] overflow-y-auto">
                          {/* --- OPTIMIZATION: Render filtered categories --- */}
                          {filteredCategories.map((category) => (
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
                          {/* Show "Add Custom" option only if search term is not empty
                              AND it doesn't match an existing standard category
                          */}
                          {categoryInputSearch.trim() !== '' && !isSearchMatchingExistingCategory && (
                            <CommandItem
                              key={`custom-add-${categoryInputSearch.trim()}`}
                              value={`_custom_add_${categoryInputSearch.trim()}`}
                              onSelect={() => handleCategorySelect(categoryInputSearch.trim())}
                              className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer font-semibold text-[var(--primary)] mt-1"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  customCategoryValue.toLowerCase() === categoryInputSearch.toLowerCase().trim() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Add "{categoryInputSearch.trim()}" as Custom
                            </CommandItem>
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {/* Custom Category Input: Only show if NO standard categories are selected
                      AND a custom value exists or is being typed (and not matching standard)
                  */}
                  {selectedCategories.length === 0 && (customCategoryValue.trim() || (openCategoryCombobox && categoryInputSearch.trim() !== '' && !isSearchMatchingExistingCategory)) && (
                    <Input
                      placeholder="Enter custom category"
                      value={customCategoryValue} // IMPORTANT: Make inputs controlled
                      onChange={(e) => setCustomCategoryValue(e.target.value)}
                      className="mt-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                      required={selectedCategories.length === 0 && !customCategoryValue.trim()}
                    />
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={onGenerateCourse}
                    disabled={loading || !formData.name || formData.chapters <= 0 || !formData.difficulty || (!selectedCategories.length && !customCategoryValue.trim())}
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
