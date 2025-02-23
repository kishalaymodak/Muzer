"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MusicIcon, PlayIcon, UsersIcon, RadioIcon } from "lucide-react";

import Link from "next/link";
import AppBar from "./AppBar";
import { signIn } from "next-auth/react";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <AppBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 text-center bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Let Your Fans Choose the{" "}
              <span className="text-purple-400">Soundtrack</span>
            </h1>
            <p className="mt-6 text-xl max-w-prose mx-auto text-gray-300">
              Muzer revolutionizes music streaming by putting the power in the
              hands of your fans. They choose what plays on your stream,
              creating a truly interactive experience.
            </p>
            <div className="mt-10">
              <Button
                onClick={() => {
                  signIn();
                }}
                size="lg"
                className="mr-4 bg-purple-600 text-white hover:bg-purple-700"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-gray-900"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-purple-400">
              Why Choose Muzer?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center bg-gray-700 p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
                <PlayIcon className="h-12 w-12 text-pink-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-purple-300">
                  Fan-Driven Playlists
                </h3>
                <p className="text-gray-300">
                  Let your audience curate your music in real-time, creating a
                  unique listening experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center bg-gray-700 p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
                <UsersIcon className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-purple-300">
                  Community Building
                </h3>
                <p className="text-gray-300">
                  Foster a strong connection with your fans through
                  collaborative music selection.
                </p>
              </div>
              <div className="flex flex-col items-center text-center bg-gray-700 p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
                <RadioIcon className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-purple-300">
                  Live Interaction
                </h3>
                <p className="text-gray-300">
                  Engage with your audience through live chat and real-time song
                  requests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Artists Section */}
        {/* <section
          id="artists"
          className="py-20 bg-gradient-to-r from-gray-900 to-indigo-900"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-purple-400">
              Popular Artists on Muzer
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="text-center transform transition-all duration-300 hover:scale-110"
                >
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-4 border-purple-600">
                    <Image
                      src={`/placeholder.svg?height=150&width=150`}
                      alt={`Artist ${i}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <p className="font-medium text-purple-300">Artist {i}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section
          id="signup"
          className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-purple-300">
              Ready to Transform Your Streams?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-300">
              Join Muzer today and give your audience the power to shape your
              music. Sign up now for early access and exclusive features!
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 text-white placeholder-gray-400 border-gray-700 focus:border-purple-500"
                required
              />
              <Button
                type="submit"
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                Get Early Access
              </Button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-6 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <MusicIcon className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-semibold text-purple-400">
                Muzer
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="#"
                className="text-sm hover:text-purple-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm hover:text-purple-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm hover:text-purple-400 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} Muzer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
