"use client";

export const guestStore = {
  get isGuest() { 
    return localStorage.getItem('rs_is_guest') === 'true'; 
  },
  
  setGuest(val: boolean) { 
    if(val) localStorage.setItem('rs_is_guest', 'true'); 
    else localStorage.removeItem('rs_is_guest');
  },
  
  get intendedPath() { 
    return localStorage.getItem('rs_intended_path'); 
  },
  
  setIntendedPath(val: string | null) {
    if(val) localStorage.setItem('rs_intended_path', val);
    else localStorage.removeItem('rs_intended_path');
  }
};
