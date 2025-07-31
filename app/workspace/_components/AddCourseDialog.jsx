'use client';
import React, { useState } from "react";
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
import { Loader2, Sparkle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

function AddCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chapters: 0,
    includeVideo: false,
    difficulty: "",
    category: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onGenerateCourse = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Course Description (optional)</label>
                <Textarea
                  placeholder="Provide a brief description of what the course will cover."
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Number of Chapters</label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  onChange={(e) => handleInputChange("chapters", e.target.value)}
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                  min="1" 
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="font-medium text-[var(--foreground)]">Include video lessons?</label>
                <Switch
                  checked={formData.includeVideo}
                  onCheckedChange={() =>
                    handleInputChange("includeVideo", !formData.includeVideo)
                  }
                  className="switch-custom" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Difficulty Level</label>
                <Select onValueChange={(val) => handleInputChange("difficulty", val)}>
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

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Category</label>
                <Input
                  placeholder="e.g. Web Dev, AI, History, Art"
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={onGenerateCourse}
                  disabled={loading}
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
    </Dialog>
  );
}

export default AddCourseDialog;
