// Deno Edge Function Type Declarations
// This file provides type declarations for Supabase Edge Functions
// These functions run in Deno runtime, not Node.js

// Global Web API types
declare global {
  // Web API globals
  const Request: {
    new(input: RequestInfo, init?: RequestInit): Request;
    prototype: Request;
  };
  
  const Response: {
    new(body?: BodyInit, init?: ResponseInit): Response;
    prototype: Response;
  };
  
  const JSON: {
    parse(text: string): any;
    stringify(value: any): string;
  };
  
  const console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
  };
  
  // Basic JavaScript types
  interface Array<T> {
    length: number;
    [index: number]: T;
  }
  
  interface Boolean {}
  interface Number {}
  interface String {}
  interface Object {}
  interface Function {}
  interface RegExp {}
  interface Error {
    message: string;
    name: string;
  }
  
  const Error: {
    new(message?: string): Error;
    prototype: Error;
  };
  
  // Deno global
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

// Module declarations
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (request: any) => any): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.38.0" {
  export function createClient(url: string, key: string, options?: any): any;
}

export {};