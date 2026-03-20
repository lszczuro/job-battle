import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export const useExampleSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Opowiedz o sobie",
        message: "Chętnie się przedstawię. Mam doświadczenie w tej branży i jestem otwarty na nowe możliwości.",
      },
      {
        title: "Pytanie o kulturę firmy",
        message: "Zanim odpowiem, chciałbym wiedzieć więcej o kulturze pracy w firmie. Jak wygląda codzienna praca w zespole?",
      },
      {
        title: "Motywacja do zmiany",
        message: "Szukam miejsca, gdzie mogę się rozwijać technicznie i mieć realny wpływ na produkt.",
      },
      {
        title: "Oczekiwania finansowe",
        message: "Moje oczekiwania finansowe są zgodne z ofertą. Ważniejsza jest dla mnie atmosfera i możliwości rozwoju.",
      },
    ],
    available: "always",
  });
};
