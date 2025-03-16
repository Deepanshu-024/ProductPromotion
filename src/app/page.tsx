"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email");
    const { data, error } = await supabase.from('Users').insert({ email })
  }
  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" name="email" placeholder="email" />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
