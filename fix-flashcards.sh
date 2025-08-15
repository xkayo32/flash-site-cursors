#!/bin/bash

# Fix the broken FlashcardsPage.tsx file
cd /home/administrator/flash-site-cursors/frontend

# Remove broken lines from the file
sed -i '1359,1433d' src/pages/student/FlashcardsPage.tsx

echo "Fixed FlashcardsPage.tsx"