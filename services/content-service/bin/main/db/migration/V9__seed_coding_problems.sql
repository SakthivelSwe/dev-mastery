-- Seed Dummy Coding Problem for Phase 2 Testing

INSERT INTO coding_problems (
    id,
    title,
    slug,
    description,
    difficulty,
    starter_code,
    solution_code,
    test_cases,
    is_published,
    order_index
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Validate Binary Search Tree',
    'validate-binary-search-tree',
    'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node''s key. The right subtree of a node contains only nodes with keys greater than the node''s key. Both the left and right subtrees must also be binary search trees.',
    'medium',
    '{"java": "class Solution {\n    public boolean isValidBST(TreeNode root) {\n        // Write your code here\n        return false;\n    }\n}"}',
    '{"java": "class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return validate(root, null, null);\n    }\n    private boolean validate(TreeNode node, Integer low, Integer high) {\n        if (node == null) return true;\n        if ((low != null && node.val <= low) || (high != null && node.val >= high)) return false;\n        return validate(node.left, low, node.val) && validate(node.right, node.val, high);\n    }\n}"}',
    '[{"input": "[2,1,3]", "expectedOutput": "true", "isHidden": false}, {"input": "[5,1,4,null,null,3,6]", "expectedOutput": "false", "isHidden": false}]',
    TRUE,
    1
);
