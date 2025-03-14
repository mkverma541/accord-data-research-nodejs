const express = require("express");
const { pool } = require("../../config/database");

async function searchFilesFolders(req, res) {
  try {
    const { query } = req.query;

    let files = [];
    let folders = [];

    // If there is a query, build the search conditions
    if (query) {
      const params = [`%${query}%`];

      // Fetch data for files (if needed) and folders
      [files] = await pool.execute(
        `SELECT slug, title FROM res_files WHERE title LIKE ?`,
        params
      );

      [folders] = await pool.execute(
        `SELECT folder_id, slug, title, parent_id FROM res_folders WHERE title LIKE ?`,
        params
      );
    } 
   
    // Generate folder paths by traversing up the folder hierarchy
    const folderPaths = await Promise.all(
      folders.map(async (folder) => {
        const path = await getFolderPath(folder.folder_id);
        return {
          slug: folder.slug,
          title: folder.title,
          path,
        };
      })
    );

    // Send the results to the client
    res.status(200).json({
      status: "success",
      data: { files, folders: folderPaths },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

// Helper function to get folder path based on folder hierarchy
async function getFolderPath(folderId) {
  const breadcrumbs = []; // To store breadcrumb information

  let currentFolder = null;
  
  if (folderId) {
    const [rows] = await pool.execute(
      "SELECT folder_id, parent_id, title, slug FROM res_folders WHERE folder_id = ?",
      [folderId]
    );

    if (rows.length > 0) {
      currentFolder = rows[0];
      
      // Traverse up the hierarchy for the folder
      while (currentFolder) {
        breadcrumbs.unshift({ title: currentFolder.title, slug: currentFolder.slug }); // Add current folder to breadcrumbs

        // Fetch the parent folder
        const [parentRows] = await pool.execute(
          "SELECT folder_id, parent_id, title, slug FROM res_folders WHERE folder_id = ?",
          [currentFolder.parent_id]
        );

        if (parentRows.length === 0) {
          // No more parents found, exit the loop
          break;
        }

        // Move to the parent folder
        currentFolder = parentRows[0];
      }
    }
  }

  // Join all the breadcrumbs into a single string path, like "parent_folder/sub_folder"
  return breadcrumbs.map(folder => folder.slug).join('/');
}

module.exports = {
  searchFilesFolders,
};
