import { atomWithLocalStorage } from ".";

export const userAtom = atomWithLocalStorage<string | null>("user", null);
