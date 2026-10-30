'use client';
import React, { useState, useEffect, useCallback } from "react";
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
import { Loader2, Sparkle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

import CategoryPicker from './CategoryPicker';
import { LANGUAGES, MAX_CHAPTERS } from '@/lib/validation';

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
    language: "English",
  });

  const [selectedChapterOption, setSelectedChapterOption] = useState('');
  const [customChapters, setCustomChapters] = useState('');

  
  const [selectedCategories, setSelectedCategories] = useState([]);


  useEffect(() => {
    let chaptersNum = 0;
    if (selectedChapterOption === 'other') {
      chaptersNum = parseInt(customChapters, 10);
      chaptersNum = isNaN(chaptersNum) ? 0 : Math.min(chaptersNum, MAX_CHAPTERS);
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

  const onGenerateCourse = async () => {
    if (!formData.name || formData.chapters <= 0 || !formData.difficulty || selectedCategories.length === 0) {
      toast.error("Please fill in all required fields!", {
        description: "Course Name, Chapters, Difficulty, and at least one Category are required.",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      // The server validates the form and assigns the course id.
      const result = await axios.post("/api/generate-course-layout", formData);
      router.push("/workspace/edit-course/" + result.data?.courseId);
    } catch (error) {
      const data = error.response?.data;
      toast.error("Couldn't create the course outline.", {
        description: data?.issues?.[0]?.message || data?.error || "Please try again.",
        duration: 5000,
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
      language: "English",
    });
    setSelectedChapterOption('');
    setCustomChapters('');
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
                      max={MAX_CHAPTERS}
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
                  <label className="font-medium text-[var(--foreground)]">Course Language</label>
                  <Select onValueChange={(val) => handleInputChange("language", val)} value={formData.language}>
                    <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang} className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                
                {/* --- Categories: chosen in their own modal (CategoryPicker) --- */}
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-[var(--foreground)]">Categories</label>
                  <CategoryPicker value={selectedCategories} onChange={setSelectedCategories} />
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
