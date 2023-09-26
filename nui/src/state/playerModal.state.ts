import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

export enum PlayerModalTabs {
  ACTIONS,
  INFO,
  IDENTIFIERS,
  HISTORY,
  BAN,
  CARD,
}

const playerModalTabAtom = atom<PlayerModalTabs>({
  key: "playerModalTab",
  default: PlayerModalTabs.ACTIONS,
});

export const usePlayerModalTabValue = () => useRecoilValue(playerModalTabAtom);
export const useSetPlayerModalTab = () => useSetRecoilState(playerModalTabAtom);
export const usePlayerModalTab = () => useRecoilState(playerModalTabAtom);

const modalVisibilityAtom = atom({
  key: "playerModalVisibility",
  default: false,
});

export const usePlayerModalVisbilityValue = () =>
  useRecoilValue(modalVisibilityAtom);
export const usePlayerModalVisibility = () =>
  useRecoilState(modalVisibilityAtom);
export const useSetPlayerModalVisibility = () =>
  useSetRecoilState(modalVisibilityAtom);

const modalResourceAtom = atom({
    key: "playerModalResource",
    default: "",
  });
  
  export const usePlayerModalResourceValue = () =>
    useRecoilValue(modalResourceAtom);
  export const usePlayerModalResource = () =>
    useRecoilState(modalResourceAtom);
  export const useSetPlayerModalResource = () =>
    useSetRecoilState(modalResourceAtom);
  
const modalThemeAtom = atom({
      key: "menuTheme",
      default: null,
    });
    
export const useModalThemeValue = () =>
      useRecoilValue(modalThemeAtom);
export const useModalTheme = () =>
      useRecoilState(modalThemeAtom);
export const useSetModalTheme = () =>
      useSetRecoilState(modalThemeAtom);
    