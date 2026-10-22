export type WorkerGuidance = {
  heading: string;
  nextStep: string;
  workerResponsibility: string;
};

export function getWorkerGuidance(
  route: string,
  evidenceFormat: string,
  language: "en" | "es" = "en"
): WorkerGuidance {
  if (language === "es") {
    if (route === "ASSIST_PAPER") {
      return {
        heading: "Tus recibos en papel pueden ser revisados por una persona",
        nextStep:
          "En este ejemplo, una persona revisaría los recibos " +
          "y ayudaría a aclarar la información faltante.",
        workerResponsibility:
          "No necesitas pasar tus recibos a una computadora " +
          "ni llenar el formulario del revisor.",
      };
    }

    if (route === "CONTACT_SUPPLIER") {
      return {
        heading: "Una persona debe ayudar a aclarar los registros",
        nextStep:
          "En este ejemplo, la organización responsable " +
          "consultaría al proveedor sobre los datos faltantes " +
          "o las diferencias encontradas.",
        workerResponsibility:
          "No tienes que resolver la diferencia en los registros " +
          "ni llenar el formulario del revisor por tu cuenta.",
      };
    }

    return {
      heading: "Tus registros todavía pueden recibir revisión humana",
      nextStep:
        "En este ejemplo, una persona revisaría los registros " +
        "antes de decidir si necesita más información.",
      workerResponsibility:
        evidenceFormat === "paper"
          ? "Los recibos en papel no se rechazan automáticamente. " +
            "El formulario del revisor no es una tarea para ti."
          : "El formulario de decisión corresponde al revisor, no a ti.",
    };
  }
  if (route === "ASSIST_PAPER") {
    return {
      heading: "Your paper receipts can receive human review",
      nextStep:
        "In this demonstration, a reviewer would examine the paper " +
        "receipts and help clarify missing information.",
      workerResponsibility:
        "You do not need to digitize your paper receipts or complete " +
        "the reviewer decision form for this demonstration.",
    };
  }

  if (route === "CONTACT_SUPPLIER") {
    return {
      heading: "A person should help clarify the records",
      nextStep:
        "In this demonstration, the responsible organization would " +
        "contact the supplier to check missing or conflicting information.",
      workerResponsibility:
        "You are not being asked to resolve the evidence conflict " +
        "or complete the reviewer decision form yourself.",
    };
  }

  return {
    heading: "A human review remains available",
    nextStep:
      "In this demonstration, a reviewer would examine the records " +
      "before deciding whether any additional clarification is needed.",
    workerResponsibility:
      evidenceFormat === "paper"
        ? "Paper records are not automatically rejected. The reviewer " +
          "decision form is not a worker task."
        : "The reviewer decision form belongs to the reviewer, " +
          "not to the worker.",
  };
}
