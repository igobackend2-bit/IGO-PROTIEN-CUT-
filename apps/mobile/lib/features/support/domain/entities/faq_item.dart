class FaqItem {
  final String id;
  final String category;
  final String question;
  final String answer;
  final int priority;
  final int helpfulCount;
  final int notHelpfulCount;

  const FaqItem({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
    required this.priority,
    this.helpfulCount = 0,
    this.notHelpfulCount = 0,
  });

  factory FaqItem.fromMap(Map<String, dynamic> map) {
    return FaqItem(
      id: (map['id'] ?? '').toString(),
      category: (map['category'] ?? 'General').toString(),
      question: (map['question'] ?? '').toString(),
      answer: (map['answer'] ?? '').toString(),
      priority: (map['priority'] as num?)?.toInt() ?? 0,
      helpfulCount: (map['helpful_count'] as num?)?.toInt() ?? 0,
      notHelpfulCount: (map['not_helpful_count'] as num?)?.toInt() ?? 0,
    );
  }
}
