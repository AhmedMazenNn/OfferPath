#!/bin/bash
# This script pushes ONLY the backend folder to Hugging Face
echo "Pushing backend directory to Hugging Face..."
git subtree push --prefix backend hf main
echo "Deployment triggered!"
