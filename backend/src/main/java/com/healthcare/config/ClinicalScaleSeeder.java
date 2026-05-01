package com.healthcare.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.entity.ClinicalScale;
import com.healthcare.repository.ClinicalScaleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Load clinical scales seed data on application startup
 */
@Slf4j
//@Component
public class ClinicalScaleSeeder implements ApplicationRunner {

    @Autowired
    private ClinicalScaleRepository scaleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Checking clinical scales...");

        if (scaleRepository.findByNameIgnoreCase("PHQ-9").isEmpty()) {
            loadPHQ9();
        }
        if (scaleRepository.findByNameIgnoreCase("GAD-7").isEmpty()) {
            loadGAD7();
        }
        if (scaleRepository.findByNameIgnoreCase("DASS-21").isEmpty()) {
            loadDASS21();
        }
        if (scaleRepository.findByNameIgnoreCase("ISI").isEmpty()) {
            loadISI();
        }
        if (scaleRepository.findByNameIgnoreCase("PSQI").isEmpty()) {
            loadPSQI();
        }

        log.info("Clinical scales seeding completed");
    }

    private void loadPHQ9() {
        String config = """
                {
                  "questions": [
                    {"qId": "phq_q1", "content": "Little interest or pleasure in doing things", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q2", "content": "Feeling down, depressed, or hopeless", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q3", "content": "Trouble falling or staying asleep, or sleeping too much", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q4", "content": "Feeling tired or having little energy", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q5", "content": "Poor appetite or overeating", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q6", "content": "Feeling bad about yourself or that you are a failure or have let your family down", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q7", "content": "Trouble concentrating on things", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q8", "content": "Moving or speaking so slowly that others have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "phq_q9", "content": "Thoughts that you would be better off dead or of hurting yourself in some way", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}}
                  ],
                  "scoring": {
                    "type": "SUM",
                    "sourceQuestions": ["phq_q1", "phq_q2", "phq_q3", "phq_q4", "phq_q5", "phq_q6", "phq_q7", "phq_q8", "phq_q9"],
                    "resultField": "phq_total_score"
                  }
                }
                """;

        String interpretation = """
                {
                  "thresholds": [
                    {"min": 0, "max": 4, "label": "Minimal", "severity": "NORMAL"},
                    {"min": 5, "max": 9, "label": "Mild", "severity": "MILD"},
                    {"min": 10, "max": 14, "label": "Moderate", "severity": "MODERATE"},
                    {"min": 15, "max": 19, "label": "Moderately Severe", "severity": "SEVERE"},
                    {"min": 20, "max": 27, "label": "Severe", "severity": "SEVERE"}
                  ]
                }
                """;

        ClinicalScale scale = ClinicalScale.builder()
                .name("PHQ-9")
                .description("Patient Health Questionnaire-9: A 9-item self-report depression screening tool")
                .category("DEPRESSION")
                .totalQuestions(9)
                .minScore(0)
                .maxScore(27)
                .scoringFormat("LIKERT_0_3")
                .configJson(config)
                .interpretationJson(interpretation)
                .isActive(true)
                .build();

        scaleRepository.save(scale);
        log.info("Loaded PHQ-9 clinical scale");
    }

    private void loadGAD7() {
        String config = """
                {
                  "questions": [
                    {"qId": "gad_q1", "content": "Feeling nervous, anxious, or on edge", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "gad_q2", "content": "Not being able to stop or control worrying", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "gad_q3", "content": "Worrying too much about different things", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "gad_q4", "content": "Trouble relaxing", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "gad_q5", "content": "Being so restless that it is hard to sit still", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "gad_q6", "content": "Becoming easily annoyed or irritable", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}},
                    {"qId": "gad_q7", "content": "Feeling afraid as if something awful might happen", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day"}}
                  ],
                  "scoring": {
                    "type": "SUM",
                    "sourceQuestions": ["gad_q1", "gad_q2", "gad_q3", "gad_q4", "gad_q5", "gad_q6", "gad_q7"],
                    "resultField": "gad_total_score"
                  }
                }
                """;

        String interpretation = """
                {
                  "thresholds": [
                    {"min": 0, "max": 4, "label": "Minimal", "severity": "NORMAL"},
                    {"min": 5, "max": 9, "label": "Mild", "severity": "MILD"},
                    {"min": 10, "max": 14, "label": "Moderate", "severity": "MODERATE"},
                    {"min": 15, "max": 21, "label": "Severe", "severity": "SEVERE"}
                  ]
                }
                """;

        ClinicalScale scale = ClinicalScale.builder()
                .name("GAD-7")
                .description("Generalized Anxiety Disorder-7: A 7-item anxiety screening tool")
                .category("ANXIETY")
                .totalQuestions(7)
                .minScore(0)
                .maxScore(21)
                .scoringFormat("LIKERT_0_3")
                .configJson(config)
                .interpretationJson(interpretation)
                .isActive(true)
                .build();

        scaleRepository.save(scale);
        log.info("Loaded GAD-7 clinical scale");
    }

    private void loadDASS21() {
        String config = """
                {
                  "questions": [
                    {"qId": "dass_q1", "content": "I found myself getting upset by quite trivial things", "type": "SCALE", "scaleMin": 0, "scaleMax": 3, "scaleLabels": {"0": "Did not apply", "1": "Applied some of the time", "2": "Applied most of the time", "3": "Applied very much most of the time"}},
                    {"qId": "dass_q2", "content": "I was aware of dryness of my mouth", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q3", "content": "I could not experience any positive feeling at all", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q4", "content": "I experienced breathing difficulty", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q5", "content": "I found it difficult to work up the initiative to do things", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q6", "content": "I tended to over-react to situations", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q7", "content": "I experienced trembling", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q8", "content": "I was in a state of nervous tension", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q9", "content": "I was unhappy and depressed", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q10", "content": "I was intolerant of anything that kept me from getting on with what I was doing", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q11", "content": "I felt that I was pretty worthless", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q12", "content": "I was rather touchy", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q13", "content": "I was aware of the action of my heart in the absence of physical exertion", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q14", "content": "I felt scared without any good reason", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q15", "content": "I felt that life was meaningless", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q16", "content": "I found it hard to wind down", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q17", "content": "I had difficulty in swallowing", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q18", "content": "I could not seem to get going", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q19", "content": "I was worried about situations in which I might panic and make a fool of myself", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q20", "content": "I felt that I had nothing to look forward to", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "dass_q21", "content": "I found myself getting agitated", "type": "SCALE", "scaleMin": 0, "scaleMax": 3}
                  ],
                  "scoring": {
                    "type": "SUBSCALE",
                    "subscales": [
                      {"name": "Depression", "questions": ["dass_q3", "dass_q5", "dass_q9", "dass_q11", "dass_q15", "dass_q18", "dass_q20"]},
                      {"name": "Anxiety", "questions": ["dass_q2", "dass_q4", "dass_q7", "dass_q8", "dass_q13", "dass_q14", "dass_q17"]},
                      {"name": "Stress", "questions": ["dass_q1", "dass_q6", "dass_q10", "dass_q12", "dass_q16", "dass_q19", "dass_q21"]}
                    ]
                  }
                }
                """;

        String interpretation = """
                {
                  "note": "DASS-21 has 3 subscales. Each scale 0-21 (normal 0-7, mild 8-9, moderate 10-13, severe 14-20, extremely severe 21+)",
                  "thresholds": [
                    {"min": 0, "max": 7, "label": "Normal", "severity": "NORMAL"},
                    {"min": 8, "max": 9, "label": "Mild", "severity": "MILD"},
                    {"min": 10, "max": 13, "label": "Moderate", "severity": "MODERATE"},
                    {"min": 14, "max": 20, "label": "Severe", "severity": "SEVERE"},
                    {"min": 21, "max": 63, "label": "Extremely Severe", "severity": "SEVERE"}
                  ]
                }
                """;

        ClinicalScale scale = ClinicalScale.builder()
                .name("DASS-21")
                .description("Depression Anxiety Stress Scales-21: 21-item composite assessment with 3 subscales")
                .category("COMPOSITE")
                .totalQuestions(21)
                .minScore(0)
                .maxScore(63)
                .scoringFormat("LIKERT_0_3")
                .configJson(config)
                .interpretationJson(interpretation)
                .isActive(true)
                .build();

        scaleRepository.save(scale);
        log.info("Loaded DASS-21 clinical scale");
    }

    private void loadISI() {
        String config = """
                {
                  "questions": [
                    {"qId": "isi_q1", "content": "Please rate the severity of your sleep problem. Consider the average sleep problem over the last 2 weeks.", "type": "SCALE", "scaleMin": 0, "scaleMax": 4, "scaleLabels": {"0": "No problem", "1": "Mild", "2": "Moderate", "3": "Severe", "4": "Very Severe"}},
                    {"qId": "isi_q2", "content": "How satisfied/dissatisfied are you with your sleep pattern?", "type": "SCALE", "scaleMin": 0, "scaleMax": 4, "scaleLabels": {"0": "Very Satisfied", "1": "Satisfied", "2": "Neutral", "3": "Dissatisfied", "4": "Very Dissatisfied"}},
                    {"qId": "isi_q3", "content": "How much does your sleep problem interfere with your daily functioning?", "type": "SCALE", "scaleMin": 0, "scaleMax": 4, "scaleLabels": {"0": "Not at all", "1": "A little", "2": "Somewhat", "3": "Much", "4": "Very Much"}},
                    {"qId": "isi_q4", "content": "How noticeable to others is your sleep problem?", "type": "SCALE", "scaleMin": 0, "scaleMax": 4, "scaleLabels": {"0": "Not at all", "1": "A little", "2": "Somewhat", "3": "Much", "4": "Very Much"}},
                    {"qId": "isi_q5", "content": "How much distress/concern do you have about your sleep problem?", "type": "SCALE", "scaleMin": 0, "scaleMax": 4, "scaleLabels": {"0": "None", "1": "A little", "2": "Some", "3": "Much", "4": "A great deal"}}
                  ],
                  "scoring": {
                    "type": "SUM",
                    "sourceQuestions": ["isi_q1", "isi_q2", "isi_q3", "isi_q4", "isi_q5"],
                    "resultField": "isi_total_score"
                  }
                }
                """;

        String interpretation = """
                {
                  "thresholds": [
                    {"min": 0, "max": 7, "label": "No clinically significant insomnia", "severity": "NORMAL"},
                    {"min": 8, "max": 14, "label": "Subthreshold insomnia", "severity": "MILD"},
                    {"min": 15, "max": 21, "label": "Clinical insomnia (moderate)", "severity": "MODERATE"},
                    {"min": 22, "max": 28, "label": "Clinical insomnia (severe)", "severity": "SEVERE"}
                  ]
                }
                """;

        ClinicalScale scale = ClinicalScale.builder()
                .name("ISI")
                .description("Insomnia Severity Index: A 7-item insomnia assessment tool")
                .category("SLEEP")
                .totalQuestions(5)
                .minScore(0)
                .maxScore(28)
                .scoringFormat("LIKERT_0_4")
                .configJson(config)
                .interpretationJson(interpretation)
                .isActive(true)
                .build();

        scaleRepository.save(scale);
        log.info("Loaded ISI clinical scale");
    }

    private void loadPSQI() {
        String config = """
                {
                  "questions": [
                    {"qId": "psqi_q1", "content": "During the past month, when have you usually gone to bed?", "type": "TIME"},
                    {"qId": "psqi_q2", "content": "During the past month, how long (in minutes) has it usually taken you to fall asleep each night?", "type": "NUMBER"},
                    {"qId": "psqi_q3", "content": "During the past month, when have you usually gotten up in the morning?", "type": "TIME"},
                    {"qId": "psqi_q4", "content": "During the past month, how many hours of actual sleep did you get at night?", "type": "NUMBER"},
                    {"qId": "psqi_q5", "content": "Very difficult to fall asleep", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "psqi_q6", "content": "Wake up in the middle of the night or early morning", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "psqi_q7", "content": "Have to get up to use the bathroom", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "psqi_q8", "content": "Cannot breathe comfortably", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "psqi_q9", "content": "Cough or snore loudly", "type": "SCALE", "scaleMin": 0, "scaleMax": 3},
                    {"qId": "psqi_q10", "content": "Feel too cold or too hot", "type": "SCALE", "scaleMin": 0, "scaleMax": 3}
                  ],
                  "scoring": {
                    "type": "COMPLEX",
                    "description": "PSQI has 7 components each scored 0-3, total 0-21"
                  }
                }
                """;

        String interpretation = """
                {
                  "thresholds": [
                    {"min": 0, "max": 5, "label": "Good sleep quality", "severity": "NORMAL"},
                    {"min": 6, "max": 10, "label": "Poor sleep quality", "severity": "MODERATE"},
                    {"min": 11, "max": 21, "label": "Very poor sleep quality", "severity": "SEVERE"}
                  ]
                }
                """;

        ClinicalScale scale = ClinicalScale.builder()
                .name("PSQI")
                .description("Pittsburgh Sleep Quality Index: Comprehensive sleep quality assessment")
                .category("SLEEP")
                .totalQuestions(10)
                .minScore(0)
                .maxScore(21)
                .scoringFormat("COMPLEX")
                .configJson(config)
                .interpretationJson(interpretation)
                .isActive(true)
                .build();

        scaleRepository.save(scale);
        log.info("Loaded PSQI clinical scale");
    }
}
