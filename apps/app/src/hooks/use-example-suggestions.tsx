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
    ],
    available: "always",
  });
};
