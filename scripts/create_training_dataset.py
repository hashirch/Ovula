#!/usr/bin/env python3
"""
Create a concise training dataset for PCOS assistant
Combines data from multiple sources and generates Q&A pairs
"""

import json
import random
from pathlib import Path

# Concise response templates
CONCISE_TEMPLATES = {
    "symptoms": [
        "Common PCOS symptoms include: {symptoms}. Severity varies per person.",
        "You might experience: {symptoms}. Not everyone has all symptoms.",
        "PCOS symptoms: {symptoms}. Consult a doctor for diagnosis."
    ],
    "treatment": [
        "Treatment options: {treatment}. Your doctor will recommend what's best for you.",
        "Common treatments: {treatment}. Effectiveness varies by individual.",
        "{treatment} are typical approaches. Discuss with your healthcare provider."
    ],
    "lifestyle": [
        "Lifestyle tips: {tips}. Small changes can make a big difference.",
        "Try: {tips}. Consistency is key.",
        "Helpful changes: {tips}. Start with one at a time."
    ],
    "diet": [
        "Diet recommendations: {diet}. Focus on whole foods and balance.",
        "Eat: {diet}. Avoid processed foods and excess sugar.",
        "Nutrition tips: {diet}. Stay hydrated and eat regularly."
    ]
}

def load_json_file(filepath):
    """Load JSON file"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return []

def load_jsonl_file(filepath):
    """Load JSONL file"""
    data = []
    try:
        with open(filepath, 'r') as f:
            for line in f:
                if line.strip():
                    data.append(json.loads(line))
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
    return data

def create_concise_qa_pairs():
    """Create concise Q&A pairs"""
    qa_pairs = []
    
    # Basic PCOS questions with concise answers
    basic_qa = [
        {
            "question": "What is PCOS?",
            "answer": "PCOS (Polycystic Ovary Syndrome) is a hormonal disorder causing irregular periods, excess androgens, and ovarian cysts. It affects 1 in 10 women."
        },
        {
            "question": "What causes PCOS?",
            "answer": "Exact cause unknown. Factors include insulin resistance, inflammation, genetics, and hormone imbalances. It's not your fault."
        },
        {
            "question": "Can PCOS be cured?",
            "answer": "No cure, but highly manageable with lifestyle changes, medication, and proper care. Many women live normal, healthy lives."
        },
        {
            "question": "How is PCOS diagnosed?",
            "answer": "Diagnosis requires 2 of 3: irregular periods, high androgens, or polycystic ovaries on ultrasound. Blood tests and physical exam also help."
        },
        {
            "question": "Does PCOS affect fertility?",
            "answer": "PCOS can make conception harder but not impossible. Many women with PCOS have successful pregnancies with treatment."
        },
        {
            "question": "What are PCOS symptoms?",
            "answer": "Common symptoms: irregular periods, excess hair growth, acne, weight gain, hair loss, dark skin patches. Symptoms vary widely."
        },
        {
            "question": "How to lose weight with PCOS?",
            "answer": "Focus on: low-GI diet, regular exercise (cardio + strength), adequate sleep, stress management. Even 5-10% weight loss helps."
        },
        {
            "question": "Best diet for PCOS?",
            "answer": "Low-GI, anti-inflammatory diet. Eat: whole grains, lean protein, vegetables, healthy fats. Limit: sugar, processed foods, refined carbs."
        },
        {
            "question": "What exercises help PCOS?",
            "answer": "Mix cardio (walking, cycling) with strength training. HIIT is effective. Aim for 150 min/week. Consistency matters more than intensity."
        },
        {
            "question": "Can I get pregnant with PCOS?",
            "answer": "Yes! Many women with PCOS conceive naturally or with fertility treatments. Lifestyle changes and medications can improve ovulation."
        },
        {
            "question": "What medications treat PCOS?",
            "answer": "Common: birth control (regulate periods), metformin (insulin resistance), spironolactone (excess hair). Your doctor will prescribe based on symptoms."
        },
        {
            "question": "Is PCOS serious?",
            "answer": "PCOS increases risk of diabetes, heart disease, and endometrial cancer. Regular monitoring and healthy lifestyle reduce these risks significantly."
        },
        {
            "question": "How to manage PCOS naturally?",
            "answer": "Key strategies: balanced diet, regular exercise, stress reduction, adequate sleep, maintain healthy weight. Supplements like inositol may help."
        },
        {
            "question": "Does PCOS cause hair loss?",
            "answer": "Yes, high androgens can cause scalp hair thinning. Treatments: anti-androgens, minoxidil, proper hair care. Consult a dermatologist."
        },
        {
            "question": "Why am I gaining weight with PCOS?",
            "answer": "Insulin resistance and hormonal imbalances make weight gain easier and loss harder. Focus on diet, exercise, and possibly metformin."
        },
        {
            "question": "Can PCOS go away?",
            "answer": "PCOS is lifelong but symptoms can improve significantly with treatment. Some women see improvement after menopause."
        },
        {
            "question": "What foods to avoid with PCOS?",
            "answer": "Limit: refined carbs, sugary foods/drinks, processed foods, fried foods, excessive dairy. Focus on whole, unprocessed foods."
        },
        {
            "question": "How to reduce facial hair with PCOS?",
            "answer": "Options: anti-androgen medications, birth control, laser hair removal, electrolysis. Temporary: waxing, threading, depilatory creams."
        },
        {
            "question": "Does stress affect PCOS?",
            "answer": "Yes, stress worsens hormonal imbalances and symptoms. Manage with: meditation, yoga, adequate sleep, therapy, regular exercise."
        },
        {
            "question": "Can birth control help PCOS?",
            "answer": "Yes, birth control regulates periods, reduces androgens, and improves acne/hair growth. Not suitable if trying to conceive."
        },
        {
            "question": "What is insulin resistance in PCOS?",
            "answer": "Body doesn't respond well to insulin, leading to high blood sugar and increased androgen production. Managed with diet, exercise, metformin."
        },
        {
            "question": "How often should I see a doctor for PCOS?",
            "answer": "Initially every 3-6 months, then annually if stable. More frequent if trying to conceive or adjusting medications."
        },
        {
            "question": "Can PCOS cause depression?",
            "answer": "Yes, hormonal imbalances and dealing with symptoms can affect mental health. Seek support from therapist or counselor if needed."
        },
        {
            "question": "What supplements help PCOS?",
            "answer": "Evidence supports: inositol, vitamin D, omega-3, chromium, NAC. Always consult doctor before starting supplements."
        },
        {
            "question": "Is intermittent fasting good for PCOS?",
            "answer": "May help some women with insulin resistance and weight loss. Start gradually, stay hydrated, and monitor how you feel."
        },
        {
            "question": "Can PCOS affect my period?",
            "answer": "Yes, irregular or absent periods are a hallmark symptom. Cycles may be longer than 35 days or fewer than 8 periods/year."
        },
        {
            "question": "What is metformin for PCOS?",
            "answer": "Diabetes medication that improves insulin sensitivity. Helps with weight loss, regular periods, and ovulation. Common side effects: GI upset."
        },
        {
            "question": "How to track PCOS symptoms?",
            "answer": "Use apps or journals to track: periods, symptoms, weight, mood, diet, exercise. Helps identify patterns and treatment effectiveness."
        },
        {
            "question": "Can PCOS cause acne?",
            "answer": "Yes, excess androgens increase oil production. Treatments: birth control, spironolactone, topical treatments, proper skincare routine."
        },
        {
            "question": "What blood tests diagnose PCOS?",
            "answer": "Tests check: testosterone, LH/FSH ratio, insulin/glucose, thyroid, prolactin. Helps rule out other conditions and guide treatment."
        }
    ]
    
    qa_pairs.extend(basic_qa)
    
    return qa_pairs

def generate_training_file(output_path):
    """Generate final training file"""
    print("Creating concise training dataset...")
    
    # Get Q&A pairs
    qa_pairs = create_concise_qa_pairs()
    
    # Load existing datasets for context
    data_dir = Path(__file__).parent.parent / "data"
    
    existing_qa = load_jsonl_file(data_dir / "pcos_dataset.jsonl")
    comprehensive = load_jsonl_file(data_dir / "pcos_comprehensive_dataset.jsonl")
    
    # Add existing Q&A but make them more concise
    for item in existing_qa[:20]:  # Limit to avoid redundancy
        if 'instruction' in item and 'output' in item:
            # Shorten output if too long
            output = item['output']
            if len(output) > 300:
                # Take first 2 sentences
                sentences = output.split('. ')
                output = '. '.join(sentences[:2]) + '.'
            
            qa_pairs.append({
                "question": item['instruction'],
                "answer": output
            })
    
    print(f"Generated {len(qa_pairs)} Q&A pairs")
    
    # Write to file
    with open(output_path, 'w') as f:
        for qa in qa_pairs:
            f.write(json.dumps(qa) + '\n')
    
    print(f"✅ Training dataset saved to: {output_path}")
    print(f"   Total examples: {len(qa_pairs)}")
    
    return len(qa_pairs)

if __name__ == "__main__":
    output_file = Path(__file__).parent.parent / "data" / "concise_training_dataset.jsonl"
    count = generate_training_file(output_file)
    print(f"\n🎉 Done! Created {count} concise training examples")
