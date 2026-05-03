export type FormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type FormVisibility = "PUBLIC" | "DOCTOR_ONLY" | "PRIVATE";

export type FormQuestionType =
	| "text"
	| "number"
	| "date"
	| "single_choice"
	| "multiple_choice"
	| "scale"
	| "file_upload"
	| "matrix"
	| "calculated"
	| "lookup"
	| "pedigree"
	| "datetime"
	| "time_series"
	| "body_map"
	| "clinical_scale"
	| "scored"
	| "repeatable_group"
	| "identity";

export type FormOption = {
	optionId: string;
	content: string;
	score: number;
	orderIndex: number;
	triggerLogic?: string | null;
};

export type FormQuestion = {
	questionId?: string;
	content: string;
	questionType: FormQuestionType;
	required: boolean;
	allowRepeat: boolean;
	orderIndex: number;
	minValue?: number | null;
	maxValue?: number | null;
	minLength?: number | null;
	maxLength?: number | null;
	validationPattern?: string | null;
	validationMessage?: string | null;
	placeholder?: string | null;
	helperText?: string | null;
	scaleMin?: number | null;
	scaleMax?: number | null;
	triggerLogic?: string | null;
	configJson?: string | null;
	allowOther?: boolean;
	scaleId?: string | null;
	options: FormOption[];
};

export type FormSection = {
	sectionId?: string;
	title: string;
	description?: string | null;
	orderIndex: number;
	allowRepeat: boolean;
	repeatLabel?: string | null;
	triggerLogic?: string | null;
	configJson?: string | null;
	questions: FormQuestion[];
};

export type FormDefinition = {
	formId?: string;
	title: string;
	description?: string | null;
	template: boolean;
	publicForm: boolean;
	visibility?: FormVisibility;
	paid: boolean;
	price: number;
	status: FormStatus;
	version: number;
	publishedAt?: string | null;
	createdAt?: string;
	updatedAt?: string;
	createdById?: string;
	createdByName?: string;
	sections: FormSection[];
};

export type FormListItem = {
	formId: string;
	title: string;
	description?: string | null;
	template: boolean;
	publicForm: boolean;
	paid: boolean;
	price: number;
	status: FormStatus;
	updatedAt: string;
	sectionCount: number;
};

export type FormAnswerValue = {
	questionId: string;
	optionId?: string | null;
	repeatIndex?: number;
	valueText?: string;
	valueNumber?: number | null;
	valueDate?: string | null;
	valueDatetime?: string | null;
	valueBoolean?: boolean | null;
	valueJson?: string | null;
};

export type FormSession = {
	sessionId: string;
	formId: string;
	patientId: string;
	visitId?: string | null;
	status: "DRAFT" | "SUBMITTED" | "VOID";
	source: "PATIENT" | "DOCTOR";
	startedAt: string;
	submittedAt?: string | null;
	lastSavedAt: string;
	totalScore: number;
	answers: FormSessionAnswer[];
};

export type FormSessionAnswer = {
	answerId: string;
	questionId: string;
	optionId?: string | null;
	repeatIndex: number;
	valueText?: string | null;
	valueNumber?: number | null;
	valueDate?: string | null;
	valueDatetime?: string | null;
	valueBoolean?: boolean | null;
	valueJson?: string | null;
};

// Pedigree Related Types
export interface PedigreeNodeDTO {
  nodeId: string;
  fullName: string;
  gender?: string; // M, F, OTHER
  yearOfBirth?: number;
  yearOfDeath?: number;
  isDeceased?: boolean;
  isProband?: boolean;
  linkedPatientId?: string;
  diseases?: string[];
  x?: number;
  y?: number;
}

export interface PedigreeEdgeDTO {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: string; // PARENT, SIBLING, SPOUSE, etc
}

export interface PedigreeAnswerDTO {
  nodes: PedigreeNodeDTO[];
  edges: PedigreeEdgeDTO[];
  rootNodeId?: string;
  version?: number;
  createdAt?: string;
}

export function createBlankForm(): FormDefinition {
	return {
		title: "",
		description: "",
		template: false,
		publicForm: false,
		visibility: "DOCTOR_ONLY",
		paid: false,
		price: 0,
		status: "DRAFT",
		version: 1,
		sections: [
			{
				sectionId: crypto.randomUUID(),
				title: "Thông tin chung",
				description: "",
				orderIndex: 0,
				allowRepeat: false,
				repeatLabel: "",
				questions: [
					{
						questionId: crypto.randomUUID(),
						content: "Họ và tên",
						questionType: "text",
						required: true,
						allowRepeat: false,
						orderIndex: 0,
						options: [],
					},
				],
			},
		],
	};
}
