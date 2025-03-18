import React from 'react'
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

const LoginForm = () => {

const formRef = useRef<HTMLFormElement>(null);
const [passwordError, setPasswordError] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    
    if(password == ""){
        setPasswordError("Enter a password:");
        alert("Enter a password to submit the form");
        return;
    }

    setPasswordError("");
    // Insert all user data in one operation
    const { data, error } = await supabase
      .from('Profiles')
      .insert({ 
        full_name: name, 
        email, 
        password 
      });
      formRef.current?.reset();
    if (error) {
      console.error("Error creating user:", error);
      
    } else {
      console.log("User created:", data);
    }

  }
  
  return (
    <div className="flex flex-col gap-4">
      <form ref={formRef} onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="name" />
        <input type="email" name="email" placeholder="email" />
        <input type="password" name="password" placeholder="password"/>
        <Button type="submit">Login</Button>
      </form>
    </div>
  )
}

export default LoginForm