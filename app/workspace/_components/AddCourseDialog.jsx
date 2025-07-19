"use client";
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
      <DialogContent className="backdrop-blur-sm bg-white/80 border border-neutral-200 shadow-xl max-w-lg rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-800">
            Generate New Course
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-5 mt-4 text-sm text-neutral-700">
              <div className="flex flex-col gap-1">
                <label className="font-medium">Course Name</label>
                <Input
                  placeholder="Enter course name"
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">Course Description (optional)</label>
                <Textarea
                  placeholder="Enter course description"
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">Number of Chapters</label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  onChange={(e) => handleInputChange("chapters", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-medium">Include video lessons?</label>
                <Switch
                  checked={formData.includeVideo}
                  onCheckedChange={() =>
                    handleInputChange("includeVideo", !formData.includeVideo)
                  }
                  className="switch-custom"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">Difficulty Level</label>
                <Select onValueChange={(val) => handleInputChange("difficulty", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">Category</label>
                <Input
                  placeholder="e.g. Web Dev, AI, etc."
                  onChange={(e) => handleInputChange("category", e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={onGenerateCourse}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkle className="w-4 h-4" />
                  )}
                  Generate Course
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
