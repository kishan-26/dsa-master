export interface CuratedQuestion {
  title: string;
  leetcodeSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  patterns: string[];
}

// Sourced from NeetCode's public 150-problem roadmap (18 topic categories),
// de-duplicated down to ~129 unique problems since several problems appear
// under more than one category on the original list. Titles/slugs are
// factual metadata (like a table of contents) — no problem statements are
// stored, consistent with the rest of the app. Difficulty labels reflect
// widely-known, publicly documented LeetCode difficulty ratings.
export const CURATED_QUESTIONS: CuratedQuestion[] = [
  // Array & Hashing
  { title: "Two Sum", leetcodeSlug: "two-sum", difficulty: "Easy", topic: "Array & Hashing", patterns: ["Hash Map"] },
  { title: "Valid Anagram", leetcodeSlug: "valid-anagram", difficulty: "Easy", topic: "Array & Hashing", patterns: ["Hash Map"] },
  { title: "Contains Duplicate", leetcodeSlug: "contains-duplicate", difficulty: "Easy", topic: "Array & Hashing", patterns: ["Hash Map"] },
  { title: "Product of Array Except Self", leetcodeSlug: "product-of-array-except-self", difficulty: "Medium", topic: "Array & Hashing", patterns: ["Prefix Sum"] },
  { title: "Maximum Subarray", leetcodeSlug: "maximum-subarray", difficulty: "Medium", topic: "Array & Hashing", patterns: ["Kadane's Algorithm"] },
  { title: "Maximum Product Subarray", leetcodeSlug: "maximum-product-subarray", difficulty: "Medium", topic: "Array & Hashing", patterns: ["Dynamic Programming"] },
  { title: "Find Minimum in Rotated Sorted Array", leetcodeSlug: "find-minimum-in-rotated-sorted-array", difficulty: "Medium", topic: "Array & Hashing", patterns: ["Modified Binary Search"] },
  { title: "Search in Rotated Sorted Array", leetcodeSlug: "search-in-rotated-sorted-array", difficulty: "Medium", topic: "Array & Hashing", patterns: ["Modified Binary Search"] },
  { title: "3Sum", leetcodeSlug: "3sum", difficulty: "Medium", topic: "Array & Hashing", patterns: ["Two Pointers"] },
  { title: "Container With Most Water", leetcodeSlug: "container-with-most-water", difficulty: "Medium", topic: "Array & Hashing", patterns: ["Two Pointers"] },

  // Two Pointers
  { title: "Valid Palindrome", leetcodeSlug: "valid-palindrome", difficulty: "Easy", topic: "Two Pointers", patterns: ["Two Pointers"] },
  { title: "Trapping Rain Water", leetcodeSlug: "trapping-rain-water", difficulty: "Hard", topic: "Two Pointers", patterns: ["Two Pointers"] },
  { title: "Best Time to Buy and Sell Stock", leetcodeSlug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", topic: "Two Pointers", patterns: ["Two Pointers"] },
  { title: "Longest Substring Without Repeating Characters", leetcodeSlug: "longest-substring-without-repeating-characters", difficulty: "Medium", topic: "Two Pointers", patterns: ["Sliding Window"] },
  { title: "Palindromic Substrings", leetcodeSlug: "palindromic-substrings", difficulty: "Medium", topic: "Two Pointers", patterns: ["Two Pointers", "1-D DP"] },
  { title: "Longest Palindromic Substring", leetcodeSlug: "longest-palindromic-substring", difficulty: "Medium", topic: "Two Pointers", patterns: ["Two Pointers", "1-D DP"] },
  { title: "Median of Two Sorted Arrays", leetcodeSlug: "median-of-two-sorted-arrays", difficulty: "Hard", topic: "Two Pointers", patterns: ["Binary Search"] },

  // Sliding Window
  { title: "Longest Repeating Character Replacement", leetcodeSlug: "longest-repeating-character-replacement", difficulty: "Medium", topic: "Sliding Window", patterns: ["Sliding Window"] },
  { title: "Permutation in String", leetcodeSlug: "permutation-in-string", difficulty: "Medium", topic: "Sliding Window", patterns: ["Sliding Window"] },
  { title: "Minimum Window Substring", leetcodeSlug: "minimum-window-substring", difficulty: "Hard", topic: "Sliding Window", patterns: ["Sliding Window"] },
  { title: "Sliding Window Maximum", leetcodeSlug: "sliding-window-maximum", difficulty: "Hard", topic: "Sliding Window", patterns: ["Sliding Window", "Monotonic Deque"] },

  // Stack
  { title: "Valid Parentheses", leetcodeSlug: "valid-parentheses", difficulty: "Easy", topic: "Stack", patterns: ["Stack"] },
  { title: "Min Stack", leetcodeSlug: "min-stack", difficulty: "Medium", topic: "Stack", patterns: ["Stack"] },
  { title: "Generate Parentheses", leetcodeSlug: "generate-parentheses", difficulty: "Medium", topic: "Stack", patterns: ["Backtracking"] },
  { title: "Daily Temperatures", leetcodeSlug: "daily-temperatures", difficulty: "Medium", topic: "Stack", patterns: ["Monotonic Stack"] },
  { title: "Evaluate Reverse Polish Notation", leetcodeSlug: "evaluate-reverse-polish-notation", difficulty: "Medium", topic: "Stack", patterns: ["Stack"] },
  { title: "Largest Rectangle in Histogram", leetcodeSlug: "largest-rectangle-in-histogram", difficulty: "Hard", topic: "Stack", patterns: ["Monotonic Stack"] },
  { title: "Car Fleet", leetcodeSlug: "car-fleet", difficulty: "Medium", topic: "Stack", patterns: ["Stack"] },
  { title: "Binary Search Tree Iterator", leetcodeSlug: "binary-search-tree-iterator", difficulty: "Medium", topic: "Stack", patterns: ["Stack", "Binary Search Tree"] },
  { title: "Basic Calculator II", leetcodeSlug: "basic-calculator-ii", difficulty: "Medium", topic: "Stack", patterns: ["Stack"] },

  // Binary Search
  { title: "Binary Search", leetcodeSlug: "binary-search", difficulty: "Easy", topic: "Binary Search", patterns: ["Binary Search"] },
  { title: "Search a 2D Matrix", leetcodeSlug: "search-a-2d-matrix", difficulty: "Medium", topic: "Binary Search", patterns: ["Binary Search"] },
  { title: "Koko Eating Bananas", leetcodeSlug: "koko-eating-bananas", difficulty: "Medium", topic: "Binary Search", patterns: ["Binary Search on Answer"] },
  { title: "Time Based Key-Value Store", leetcodeSlug: "time-based-key-value-store", difficulty: "Medium", topic: "Binary Search", patterns: ["Binary Search", "Hash Map"] },

  // Linked List
  { title: "Reverse Linked List", leetcodeSlug: "reverse-linked-list", difficulty: "Easy", topic: "Linked List", patterns: ["Linked List"] },
  { title: "Merge Two Sorted Lists", leetcodeSlug: "merge-two-sorted-lists", difficulty: "Easy", topic: "Linked List", patterns: ["Linked List"] },
  { title: "Reorder List", leetcodeSlug: "reorder-list", difficulty: "Medium", topic: "Linked List", patterns: ["Fast & Slow Pointers"] },
  { title: "Remove Nth Node From End of List", leetcodeSlug: "remove-nth-node-from-end-of-list", difficulty: "Medium", topic: "Linked List", patterns: ["Fast & Slow Pointers"] },
  { title: "Copy List With Random Pointer", leetcodeSlug: "copy-list-with-random-pointer", difficulty: "Medium", topic: "Linked List", patterns: ["Hash Map"] },
  { title: "Add Two Numbers", leetcodeSlug: "add-two-numbers", difficulty: "Medium", topic: "Linked List", patterns: ["Linked List"] },
  { title: "Linked List Cycle", leetcodeSlug: "linked-list-cycle", difficulty: "Easy", topic: "Linked List", patterns: ["Fast & Slow Pointers"] },
  { title: "Intersection of Two Linked Lists", leetcodeSlug: "intersection-of-two-linked-lists", difficulty: "Easy", topic: "Linked List", patterns: ["Two Pointers"] },
  { title: "LRU Cache", leetcodeSlug: "lru-cache", difficulty: "Medium", topic: "Linked List", patterns: ["Hash Map", "Doubly Linked List"] },

  // Trees
  { title: "Maximum Depth of Binary Tree", leetcodeSlug: "maximum-depth-of-binary-tree", difficulty: "Easy", topic: "Trees", patterns: ["DFS"] },
  { title: "Same Tree", leetcodeSlug: "same-tree", difficulty: "Easy", topic: "Trees", patterns: ["DFS"] },
  { title: "Invert Binary Tree", leetcodeSlug: "invert-binary-tree", difficulty: "Easy", topic: "Trees", patterns: ["DFS", "BFS"] },
  { title: "Binary Tree Maximum Path Sum", leetcodeSlug: "binary-tree-maximum-path-sum", difficulty: "Hard", topic: "Trees", patterns: ["DFS"] },
  { title: "Binary Tree Level Order Traversal", leetcodeSlug: "binary-tree-level-order-traversal", difficulty: "Medium", topic: "Trees", patterns: ["BFS"] },
  { title: "Subtree of Another Tree", leetcodeSlug: "subtree-of-another-tree", difficulty: "Easy", topic: "Trees", patterns: ["DFS"] },
  { title: "Construct Binary Tree from Preorder and Inorder Traversal", leetcodeSlug: "construct-binary-tree-from-preorder-and-inorder-traversal", difficulty: "Medium", topic: "Trees", patterns: ["DFS", "Divide & Conquer"] },
  { title: "Validate Binary Search Tree", leetcodeSlug: "validate-binary-search-tree", difficulty: "Medium", topic: "Trees", patterns: ["DFS", "Binary Search Tree"] },
  { title: "Kth Smallest Element in a BST", leetcodeSlug: "kth-smallest-element-in-a-bst", difficulty: "Medium", topic: "Trees", patterns: ["DFS", "Binary Search Tree"] },
  { title: "Lowest Common Ancestor of a Binary Tree", leetcodeSlug: "lowest-common-ancestor-of-a-binary-tree", difficulty: "Medium", topic: "Trees", patterns: ["DFS"] },

  // Tries
  { title: "Implement Trie (Prefix Tree)", leetcodeSlug: "implement-trie-prefix-tree", difficulty: "Medium", topic: "Tries", patterns: ["Trie"] },
  { title: "Design Add and Search Words Data Structure", leetcodeSlug: "design-add-and-search-words-data-structure", difficulty: "Medium", topic: "Tries", patterns: ["Trie", "DFS"] },
  { title: "Word Search II", leetcodeSlug: "word-search-ii", difficulty: "Hard", topic: "Tries", patterns: ["Trie", "Backtracking"] },

  // Heap / Priority Queue
  { title: "Kth Largest Element in an Array", leetcodeSlug: "kth-largest-element-in-an-array", difficulty: "Medium", topic: "Heap / Priority Queue", patterns: ["Heap"] },
  { title: "Task Scheduler", leetcodeSlug: "task-scheduler", difficulty: "Medium", topic: "Heap / Priority Queue", patterns: ["Heap", "Greedy"] },
  { title: "Design Twitter", leetcodeSlug: "design-twitter", difficulty: "Medium", topic: "Heap / Priority Queue", patterns: ["Heap", "Hash Map"] },
  { title: "Find Median from Data Stream", leetcodeSlug: "find-median-from-data-stream", difficulty: "Hard", topic: "Heap / Priority Queue", patterns: ["Heap"] },
  { title: "Merge k Sorted Lists", leetcodeSlug: "merge-k-sorted-lists", difficulty: "Hard", topic: "Heap / Priority Queue", patterns: ["Heap", "Divide & Conquer"] },
  { title: "Top K Frequent Elements", leetcodeSlug: "top-k-frequent-elements", difficulty: "Medium", topic: "Heap / Priority Queue", patterns: ["Heap", "Bucket Sort"] },

  // Backtracking
  { title: "Subsets", leetcodeSlug: "subsets", difficulty: "Medium", topic: "Backtracking", patterns: ["Backtracking"] },
  { title: "Combination Sum", leetcodeSlug: "combination-sum", difficulty: "Medium", topic: "Backtracking", patterns: ["Backtracking"] },
  { title: "Permutations", leetcodeSlug: "permutations", difficulty: "Medium", topic: "Backtracking", patterns: ["Backtracking"] },
  { title: "Word Search", leetcodeSlug: "word-search", difficulty: "Medium", topic: "Backtracking", patterns: ["Backtracking", "DFS"] },
  { title: "Palindrome Partitioning", leetcodeSlug: "palindrome-partitioning", difficulty: "Medium", topic: "Backtracking", patterns: ["Backtracking"] },
  { title: "N-Queens", leetcodeSlug: "n-queens", difficulty: "Hard", topic: "Backtracking", patterns: ["Backtracking"] },

  // Graphs
  { title: "Number of Islands", leetcodeSlug: "number-of-islands", difficulty: "Medium", topic: "Graphs", patterns: ["DFS", "BFS"] },
  { title: "Clone Graph", leetcodeSlug: "clone-graph", difficulty: "Medium", topic: "Graphs", patterns: ["DFS", "BFS"] },
  { title: "Max Area of Island", leetcodeSlug: "max-area-of-island", difficulty: "Medium", topic: "Graphs", patterns: ["DFS"] },
  { title: "Pacific Atlantic Water Flow", leetcodeSlug: "pacific-atlantic-water-flow", difficulty: "Medium", topic: "Graphs", patterns: ["DFS"] },
  { title: "Surrounded Regions", leetcodeSlug: "surrounded-regions", difficulty: "Medium", topic: "Graphs", patterns: ["DFS"] },
  { title: "Rotting Oranges", leetcodeSlug: "rotting-oranges", difficulty: "Medium", topic: "Graphs", patterns: ["BFS"] },
  { title: "Course Schedule", leetcodeSlug: "course-schedule", difficulty: "Medium", topic: "Graphs", patterns: ["Topological Sort", "DFS"] },
  { title: "Course Schedule II", leetcodeSlug: "course-schedule-ii", difficulty: "Medium", topic: "Graphs", patterns: ["Topological Sort"] },
  { title: "Alien Dictionary", leetcodeSlug: "alien-dictionary", difficulty: "Hard", topic: "Graphs", patterns: ["Topological Sort"] },
  { title: "Graph Valid Tree", leetcodeSlug: "graph-valid-tree", difficulty: "Medium", topic: "Graphs", patterns: ["Union Find", "DFS"] },
  { title: "Number of Connected Components in an Undirected Graph", leetcodeSlug: "number-of-connected-components-in-an-undirected-graph", difficulty: "Medium", topic: "Graphs", patterns: ["Union Find"] },

  // 1-D Dynamic Programming
  { title: "Climbing Stairs", leetcodeSlug: "climbing-stairs", difficulty: "Easy", topic: "1-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "House Robber", leetcodeSlug: "house-robber", difficulty: "Medium", topic: "1-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "House Robber II", leetcodeSlug: "house-robber-ii", difficulty: "Medium", topic: "1-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "Longest Palindromic Subsequence", leetcodeSlug: "longest-palindromic-subsequence", difficulty: "Medium", topic: "1-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "Decode Ways", leetcodeSlug: "decode-ways", difficulty: "Medium", topic: "1-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "Coin Change", leetcodeSlug: "coin-change", difficulty: "Medium", topic: "1-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "Longest Increasing Subsequence", leetcodeSlug: "longest-increasing-subsequence", difficulty: "Medium", topic: "1-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "Partition Equal Subset Sum", leetcodeSlug: "partition-equal-subset-sum", difficulty: "Medium", topic: "1-D Dynamic Programming", patterns: ["1-D DP", "Knapsack"] },

  // 2-D Dynamic Programming
  { title: "Unique Paths", leetcodeSlug: "unique-paths", difficulty: "Medium", topic: "2-D Dynamic Programming", patterns: ["2-D DP"] },
  { title: "Longest Common Subsequence", leetcodeSlug: "longest-common-subsequence", difficulty: "Medium", topic: "2-D Dynamic Programming", patterns: ["2-D DP"] },
  { title: "Word Break", leetcodeSlug: "word-break", difficulty: "Medium", topic: "2-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "Combination Sum IV", leetcodeSlug: "combination-sum-iv", difficulty: "Medium", topic: "2-D Dynamic Programming", patterns: ["1-D DP"] },
  { title: "Minimum Path Sum", leetcodeSlug: "minimum-path-sum", difficulty: "Medium", topic: "2-D Dynamic Programming", patterns: ["2-D DP"] },
  { title: "Edit Distance", leetcodeSlug: "edit-distance", difficulty: "Medium", topic: "2-D Dynamic Programming", patterns: ["2-D DP"] },
  { title: "Maximal Square", leetcodeSlug: "maximal-square", difficulty: "Medium", topic: "2-D Dynamic Programming", patterns: ["2-D DP"] },
  { title: "Burst Balloons", leetcodeSlug: "burst-balloons", difficulty: "Hard", topic: "2-D Dynamic Programming", patterns: ["2-D DP"] },

  // Greedy (includes the Intervals sub-list, which fully overlapped)
  { title: "Jump Game", leetcodeSlug: "jump-game", difficulty: "Medium", topic: "Greedy", patterns: ["Greedy"] },
  { title: "Jump Game II", leetcodeSlug: "jump-game-ii", difficulty: "Medium", topic: "Greedy", patterns: ["Greedy"] },
  { title: "Gas Station", leetcodeSlug: "gas-station", difficulty: "Medium", topic: "Greedy", patterns: ["Greedy"] },
  { title: "Hand of Straights", leetcodeSlug: "hand-of-straights", difficulty: "Medium", topic: "Greedy", patterns: ["Greedy", "Hash Map"] },
  { title: "Merge Intervals", leetcodeSlug: "merge-intervals", difficulty: "Medium", topic: "Greedy", patterns: ["Intervals"] },
  { title: "Insert Interval", leetcodeSlug: "insert-interval", difficulty: "Medium", topic: "Greedy", patterns: ["Intervals"] },
  { title: "Non-overlapping Intervals", leetcodeSlug: "non-overlapping-intervals", difficulty: "Medium", topic: "Greedy", patterns: ["Intervals", "Greedy"] },
  { title: "Meeting Rooms", leetcodeSlug: "meeting-rooms", difficulty: "Easy", topic: "Greedy", patterns: ["Intervals"] },
  { title: "Meeting Rooms II", leetcodeSlug: "meeting-rooms-ii", difficulty: "Medium", topic: "Greedy", patterns: ["Intervals", "Heap"] },

  // Math & Geometry
  { title: "Rotate Image", leetcodeSlug: "rotate-image", difficulty: "Medium", topic: "Math & Geometry", patterns: ["Matrix Traversal"] },
  { title: "Spiral Matrix", leetcodeSlug: "spiral-matrix", difficulty: "Medium", topic: "Math & Geometry", patterns: ["Matrix Traversal"] },
  { title: "Set Matrix Zeroes", leetcodeSlug: "set-matrix-zeroes", difficulty: "Medium", topic: "Math & Geometry", patterns: ["Matrix Traversal"] },
  { title: "Happy Number", leetcodeSlug: "happy-number", difficulty: "Easy", topic: "Math & Geometry", patterns: ["Fast & Slow Pointers"] },
  { title: "Plus One", leetcodeSlug: "plus-one", difficulty: "Easy", topic: "Math & Geometry", patterns: ["Math"] },
  { title: "Pow(x, n)", leetcodeSlug: "powx-n", difficulty: "Medium", topic: "Math & Geometry", patterns: ["Divide & Conquer"] },
  { title: "Multiply Strings", leetcodeSlug: "multiply-strings", difficulty: "Medium", topic: "Math & Geometry", patterns: ["Math"] },
  { title: "Rotate Array", leetcodeSlug: "rotate-array", difficulty: "Medium", topic: "Math & Geometry", patterns: ["Array Manipulation"] },

  // Bit Manipulation
  { title: "Single Number", leetcodeSlug: "single-number", difficulty: "Easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"] },
  { title: "Number of 1 Bits", leetcodeSlug: "number-of-1-bits", difficulty: "Easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"] },
  { title: "Counting Bits", leetcodeSlug: "counting-bits", difficulty: "Easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation", "1-D DP"] },
  { title: "Reverse Bits", leetcodeSlug: "reverse-bits", difficulty: "Easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"] },
  { title: "Missing Number", leetcodeSlug: "missing-number", difficulty: "Easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"] },
  { title: "Sum of Two Integers", leetcodeSlug: "sum-of-two-integers", difficulty: "Medium", topic: "Bit Manipulation", patterns: ["Bit Manipulation"] },

  // Advanced (Hard)
  { title: "Reverse Nodes in k-Group", leetcodeSlug: "reverse-nodes-in-k-group", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["Linked List"] },
  { title: "Longest Valid Parentheses", leetcodeSlug: "longest-valid-parentheses", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["Stack", "1-D DP"] },
  { title: "Regular Expression Matching", leetcodeSlug: "regular-expression-matching", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["2-D DP"] },
  { title: "Wildcard Matching", leetcodeSlug: "wildcard-matching", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["2-D DP"] },
  { title: "Word Ladder", leetcodeSlug: "word-ladder", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["BFS"] },
  { title: "Word Ladder II", leetcodeSlug: "word-ladder-ii", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["BFS", "Backtracking"] },
  { title: "Serialize and Deserialize Binary Tree", leetcodeSlug: "serialize-and-deserialize-binary-tree", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["DFS", "BFS"] },
  { title: "Palindrome Pairs", leetcodeSlug: "palindrome-pairs", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["Trie", "Hash Map"] },
  { title: "Maximal Rectangle", leetcodeSlug: "maximal-rectangle", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["Monotonic Stack", "2-D DP"] },
  { title: "First Missing Positive", leetcodeSlug: "first-missing-positive", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["Array Manipulation"] },
  { title: "N-Queens II", leetcodeSlug: "n-queens-ii", difficulty: "Hard", topic: "Advanced (Hard)", patterns: ["Backtracking"] },
];

export const CURATED_TOPICS = Array.from(new Set(CURATED_QUESTIONS.map((q) => q.topic)));
