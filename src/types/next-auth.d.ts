// src/types/next-auth.d.ts
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Extiende la interfaz de Session para que incluya el ID del usuario.
     */
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }

    /**
     * También puedes extender la interfaz de User si necesitas más campos
     * como el 'role' o 'username' en el futuro.
     */
    interface User {
        id: string;
        // role: string;
    }
}