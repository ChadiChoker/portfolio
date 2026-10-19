import { Intro } from "@/components/intro/Intro";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Stack } from "@/components/sections/Stack";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (<><Intro /><Hero /><Services /><Projects /><Experience /><Stack /><Contact /></>);
}
