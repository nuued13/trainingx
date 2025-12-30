"use client";

import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  Plus,
  Trash2,
  Edit,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Id } from "convex/_generated/dataModel";

const insertCustomGPTSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  instructions: z.string().min(1, "Instructions are required").max(5000),
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function CustomGPTsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGPT, setEditingGPT] = useState<{
    _id: string;
    name: string;
    systemPrompt: string;
  } | null>(null);
  const [chatGPT, setChatGPT] = useState<{
    _id: string;
    name: string;
    systemPrompt: string;
    description?: string;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatPending, setIsChatPending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?._id as Id<"users"> | undefined;

  const form = useForm({
    resolver: zodResolver(insertCustomGPTSchema),
    defaultValues: {
      name: "",
      instructions: "",
    },
  });

  const customGPTs = useQuery(
    api.customGPTs.getCustomGPTs,
    userId ? { userId } : "skip"
  );

  const createMutation = useMutation(api.customGPTs.createCustomGPT);
  const deleteMutation = useMutation(api.customGPTs.deleteCustomGPT);
  const updateMutation = useMutation(api.customGPTs.updateCustomGPT);
  const chatAction = useAction(api.customGPTs.chatWithCustomGPT);

  const handleCreate = async (data: z.infer<typeof insertCustomGPTSchema>) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to create a custom GPT",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createMutation({
        name: data.name,
        description: data.instructions,
        systemPrompt: data.instructions,
        creatorId: userId,
        isPublic: false,
        category: "custom",
        tags: [],
      });
      toast({ title: "Success", description: "Custom GPT created!" });
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create GPT",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (
    gptId: Id<"customAssistants">,
    data: z.infer<typeof insertCustomGPTSchema>
  ) => {
    setIsUpdating(true);
    try {
      await updateMutation({
        gptId,
        name: data.name,
        description: data.instructions,
        systemPrompt: data.instructions,
      });
      toast({ title: "Success", description: "Custom GPT updated!" });
      setEditingGPT(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update GPT",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (gptId: Id<"customAssistants">) => {
    try {
      await deleteMutation({ gptId });
      toast({ title: "Success", description: "Custom GPT deleted!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete GPT",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (editingGPT) {
      form.reset({
        name: editingGPT.name,
        instructions: editingGPT.systemPrompt,
      });
    }
  }, [editingGPT, form]);

  const handleSubmit = (data: z.infer<typeof insertCustomGPTSchema>) => {
    if (editingGPT) {
      handleUpdate(editingGPT._id as Id<"customAssistants">, data);
    } else {
      handleCreate(data);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatGPT || isChatPending) return;

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatPending(true);

    try {
      const result = await chatAction({
        gptId: chatGPT._id as Id<"customAssistants">,
        messages: newMessages,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.message },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsChatPending(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="h-full overflow-auto bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-b-[6px] border-purple-200 bg-white text-purple-500 shadow-sm">
                <Bot className="h-8 w-8 stroke-3" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  Custom Agent Builder
                </h1>
                <p className="text-lg font-medium text-slate-500">
                  Create and manage your own AI assistants.
                </p>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <JuicyButton className="gap-2">
                  <Plus className="h-5 w-5 stroke-3" />
                  Create Agent
                </JuicyButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-2 border-slate-200">
                <DialogHeader className="p-6 pb-4 border-b-2 border-slate-100 bg-slate-50/50">
                  <DialogTitle className="text-2xl font-extrabold text-slate-800">
                    Create Custom GPT
                  </DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                    Create a custom AI assistant with specific instructions
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Marketing Assistant"
                                {...field}
                                className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 placeholder:text-slate-400 focus-visible:border-purple-500 focus-visible:ring-0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                              Instructions
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="You are a helpful marketing assistant that specializes in social media content..."
                                rows={6}
                                {...field}
                                className="min-h-[150px] rounded-xl border-2 border-slate-200 bg-slate-50 p-4 font-medium text-slate-700 placeholder:text-slate-400 focus-visible:border-purple-500 focus-visible:ring-0 resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-2">
                        <JuicyButton
                          type="submit"
                          disabled={isCreating}
                          className="w-full sm:w-auto"
                        >
                          {isCreating ? "Creating..." : "Create Agent"}
                        </JuicyButton>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {customGPTs === undefined ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg font-bold text-slate-400 animate-pulse">
                Loading agents...
              </p>
            </div>
          ) : customGPTs.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Bot className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No custom agents yet
              </h3>
              <p className="text-slate-500 font-medium mt-1 mb-6">
                Create your first AI assistant to get started!
              </p>
              <JuicyButton onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-5 w-5 stroke-3" />
                Create Your First Agent
              </JuicyButton>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customGPTs.map((gpt) => (
                <div
                  key={gpt._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-500">
                        <Bot className="h-6 w-6 stroke-3" />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          onClick={() => setEditingGPT(gpt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          onClick={() => handleDelete(gpt._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800 mb-2 line-clamp-1">
                      {gpt.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">
                      {gpt.description || gpt.systemPrompt}
                    </p>
                  </div>
                  <div className="p-4 pt-0 mt-auto">
                    <JuicyButton
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setChatGPT(gpt);
                        setChatMessages([]);
                      }}
                    >
                      <MessageSquare className="mr-2 h-5 w-5 stroke-3" />
                      Chat Now
                    </JuicyButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog
            open={!!editingGPT}
            onOpenChange={(open) => !open && setEditingGPT(null)}
          >
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-2 border-slate-200">
              <DialogHeader className="p-6 pb-4 border-b-2 border-slate-100 bg-slate-50/50">
                <DialogTitle className="text-2xl font-extrabold text-slate-800">
                  Edit Custom GPT
                </DialogTitle>
                <DialogDescription className="font-medium text-slate-500">
                  Update your custom AI assistant's instructions
                </DialogDescription>
              </DialogHeader>
              <div className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Marketing Assistant"
                              {...field}
                              className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 placeholder:text-slate-400 focus-visible:border-purple-500 focus-visible:ring-0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Instructions
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="You are a helpful marketing assistant..."
                              rows={6}
                              {...field}
                              className="min-h-[150px] rounded-xl border-2 border-slate-200 bg-slate-50 p-4 font-medium text-slate-700 placeholder:text-slate-400 focus-visible:border-purple-500 focus-visible:ring-0 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-2">
                      <JuicyButton
                        type="submit"
                        disabled={isUpdating}
                        className="w-full sm:w-auto"
                      >
                        {isUpdating ? "Updating..." : "Update Agent"}
                      </JuicyButton>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!chatGPT}
            onOpenChange={(open) => !open && setChatGPT(null)}
          >
            <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 overflow-scroll rounded-3xl border-2 border-slate-200">
              <DialogHeader className="p-6 pb-4 border-b-2 border-slate-100 bg-slate-50/50">
                <DialogTitle className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-500">
                    <Bot className="h-5 w-5 stroke-3" />
                  </div>
                  {chatGPT?.name}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        Start a conversation with {chatGPT?.name}
                      </p>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 font-medium leading-relaxed ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white rounded-tr-none"
                            : "bg-slate-100 text-slate-700 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatPending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t-2 border-slate-100 bg-slate-50/50">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="h-12 rounded-xl border-2 border-slate-200 bg-white px-4 font-medium text-slate-700 focus-visible:border-blue-500 focus-visible:ring-0"
                  />
                  <JuicyButton
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isChatPending}
                    className="h-12 w-12 p-0 rounded-xl"
                  >
                    <Zap className="h-5 w-5 stroke-3 fill-current" />
                  </JuicyButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarLayout>
  );
}
