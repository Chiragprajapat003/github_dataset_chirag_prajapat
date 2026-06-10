import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDatasets, 
  createDataset, 
  updateDataset, 
  deleteDataset, 
  setFilters, 
  setPage,
  setLimit,
  fetchRandomDataset,
  bulkImportDatasets,
  fetchAnalytics
} from '../../store/slices/datasetSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X, 
  Check, 
  Loader2,
  Database,
  Sparkles,
  UploadCloud,
  Copy,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';

const DataListing = () => {
  const dispatch = useDispatch();
  const { 
    datasets, 
    total, 
    page, 
    limit, 
    totalPages, 
    loading, 
    filters,
    randomDataset,
    randomLoading,
    importLoading,
    analytics
  } = useSelector((state) => state.dataset);
  const { user } = useSelector((state) => state.auth);
  
  const isAdmin = user?.role === 'admin';

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Random / Import modal states
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Fetch repositories and language metadata for active filtering once on mount
  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  // Load datasets on mount / query state change
  useEffect(() => {
    dispatch(fetchDatasets({ page, limit, ...filters }));
  }, [dispatch, page, limit, filters]);

  // Formik for Create/Edit
  const validationSchema = Yup.object({
    recordId: Yup.string().required('Record ID is required'),
    instruction: Yup.string().required('Instruction is required'),
    input: Yup.string(),
    output: Yup.string().required('Output is required'),
    metadata: Yup.object({
      type: Yup.string().required('Type is required'),
      repo_name: Yup.string().nullable(),
      source_type: Yup.string().nullable(),
      code_element: Yup.string().nullable(),
      doc_type: Yup.string().nullable(),
      is_readme: Yup.boolean().default(false)
    })
  });

  const formik = useFormik({
    initialValues: {
      recordId: '',
      instruction: '',
      input: '',
      output: '',
      metadata: {
        type: '',
        repo_name: '',
        source_type: '',
        code_element: '',
        doc_type: '',
        is_readme: false
      }
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isCreateOpen) {
          const result = await dispatch(createDataset(values));
          if (createDataset.fulfilled.match(result)) {
            toast.success('Dataset record created successfully!');
            setIsCreateOpen(false);
            resetForm();
          } else {
            toast.error(result.payload || 'Failed to create dataset.');
          }
        } else if (isEditOpen && selectedDataset) {
          const result = await dispatch(updateDataset({ 
            id: selectedDataset._id || selectedDataset.recordId, 
            datasetData: values 
          }));
          if (updateDataset.fulfilled.match(result)) {
            toast.success('Dataset record updated successfully!');
            setIsEditOpen(false);
            setSelectedDataset(null);
            resetForm();
          } else {
            toast.error(result.payload || 'Failed to update dataset.');
          }
        }
      } catch (err) {
        toast.error('An unexpected error occurred.');
      }
    }
  });

  const openEditModal = (dataset) => {
    setSelectedDataset(dataset);
    formik.setValues({
      recordId: dataset.recordId || '',
      instruction: dataset.instruction || '',
      input: dataset.input || '',
      output: dataset.output || '',
      metadata: {
        type: dataset.metadata?.type || '',
        repo_name: dataset.metadata?.repo_name || '',
        source_type: dataset.metadata?.source_type || '',
        code_element: dataset.metadata?.code_element || '',
        doc_type: dataset.metadata?.doc_type || '',
        is_readme: dataset.metadata?.is_readme || false
      }
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (dataset) => {
    setSelectedDataset(dataset);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDataset) return;
    const result = await dispatch(deleteDataset(selectedDataset._id || selectedDataset.recordId));
    if (deleteDataset.fulfilled.match(result)) {
      toast.success('Dataset record deleted successfully!');
      setIsDeleteOpen(false);
      setSelectedDataset(null);
    } else {
      toast.error(result.payload || 'Failed to delete dataset.');
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleRandomInspect = () => {
    dispatch(fetchRandomDataset());
    setIsRandomOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processJSONFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processJSONFile(e.target.files[0]);
    }
  };

  const processJSONFile = (file) => {
    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      toast.error("Please upload a valid .json file.");
      return;
    }
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const recordsArray = Array.isArray(json) ? json : (json.records && Array.isArray(json.records) ? json.records : null);
        
        if (!recordsArray) {
          setImportErrors(["JSON must be a flat array of dataset records, or contain a 'records' key holding an array."]);
          setImportData([]);
          return;
        }

        // Validate structure of parsed records
        const errors = [];
        const validRecords = [];
        recordsArray.forEach((record, index) => {
          const missingFields = [];
          if (!record.recordId && !record.id) missingFields.push("recordId");
          if (!record.instruction) missingFields.push("instruction");
          if (!record.output) missingFields.push("output");

          if (missingFields.length > 0) {
            errors.push(`Record [${index + 1}]: Missing required field(s): ${missingFields.join(", ")}`);
          } else {
            const formattedRecord = {
              recordId: record.recordId || record.id,
              instruction: record.instruction,
              input: record.input || '',
              output: record.output,
              metadata: {
                type: record.metadata?.type || 'imported',
                repo_name: record.metadata?.repo_name || '',
                source_type: record.metadata?.source_type || '',
                code_element: record.metadata?.code_element || '',
                doc_type: record.metadata?.doc_type || '',
                is_readme: !!record.metadata?.is_readme
              }
            };
            validRecords.push(formattedRecord);
          }
        });

        setImportErrors(errors);
        setImportData(validRecords);
      } catch (err) {
        setImportErrors([`Failed to parse JSON file: ${err.message}`]);
        setImportData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitImport = async () => {
    if (importData.length === 0) {
      toast.error("No valid records to import.");
      return;
    }
    
    const result = await dispatch(bulkImportDatasets(importData));
    if (bulkImportDatasets.fulfilled.match(result)) {
      toast.success(result.payload?.message || `${importData.length} records imported successfully!`);
      setIsImportOpen(false);
      setImportFile(null);
      setImportData([]);
      setImportErrors([]);
      dispatch(fetchDatasets({ page, limit, ...filters }));
    } else {
      toast.error(result.payload || "Failed to import datasets.");
    }
  };

  const handleSearchChange = (e) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleFilterSelect = (name, value) => {
    dispatch(setFilters({ [name]: value }));
  };

  const clearAllFilters = () => {
    dispatch(setFilters({
      type: '',
      repo: '',
      language: '',
      search: '',
      sort: '-createdAt'
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-github-lightText dark:text-white tracking-tight">Dataset Records</h2>
          <p className="text-sm text-github-lightTextMuted dark:text-github-textMuted">Manage, filter, and organize GitHub datasets index.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRandomInspect}
            className="inline-flex items-center gap-2 px-4 py-2 bg-github-lightBgSecondary hover:bg-github-lightBorder dark:bg-github-bgSecondary dark:hover:bg-github-border text-github-lightText dark:text-github-text font-bold rounded-lg text-sm transition-all border border-github-lightBorder dark:border-github-border shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            Lucky Record
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setImportFile(null);
                  setImportData([]);
                  setImportErrors([]);
                  setIsImportOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-github-lightBgSecondary hover:bg-github-lightBorder dark:bg-github-bgSecondary dark:hover:bg-github-border text-github-lightText dark:text-github-text font-bold rounded-lg text-sm transition-all border border-github-lightBorder dark:border-github-border shadow-sm"
              >
                <UploadCloud className="h-4 w-4 text-github-blue" />
                Bulk Import
              </button>

              <button
                onClick={() => {
                  formik.resetForm();
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-github-green hover:bg-github-greenHover text-white font-bold rounded-lg text-sm transition-colors border border-black/15 dark:border-white/10 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Record
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Search & Filters Panel */}
      <div className="bg-github-lightBgSecondary/40 dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-github-lightTextMuted dark:text-github-textMuted">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30 placeholder-github-lightTextMuted/70 dark:placeholder-github-textMuted/60"
              placeholder="Search instructions or outputs..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <select
              value={filters.type}
              onChange={(e) => handleFilterSelect('type', e.target.value)}
              className="px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-github-blue/30"
            >
              <option value="">All Types</option>
              <option value="function">Function</option>
              <option value="class">Class</option>
              <option value="documentation">Documentation</option>
            </select>

            <select
              value={filters.repo}
              onChange={(e) => handleFilterSelect('repo', e.target.value)}
              className="px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-github-blue/30 max-w-[180px] truncate"
            >
              <option value="">All Repositories</option>
              {(analytics?.repoDistribution || []).map((repo) => (
                <option key={repo._id} value={repo._id}>
                  {repo._id ? repo._id.split('/').pop() : 'No Repo'}
                </option>
              ))}
            </select>

            <select
              value={filters.language}
              onChange={(e) => handleFilterSelect('language', e.target.value)}
              className="px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-github-blue/30"
            >
              <option value="">All Languages</option>
              {(analytics?.languageMetrics || []).map((lang) => (
                <option key={lang._id} value={lang._id}>
                  {lang._id ? lang._id.charAt(0).toUpperCase() + lang._id.slice(1) : 'Unknown'}
                </option>
              ))}
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterSelect('sort', e.target.value)}
              className="px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-github-blue/30"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="repo">Repo Name (A-Z)</option>
              <option value="-repo">Repo Name (Z-A)</option>
              <option value="type">Type (A-Z)</option>
            </select>

            {(filters.search || filters.type || filters.language || filters.repo || filters.sort !== '-createdAt') && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-github-lightTextMuted dark:text-github-textMuted hover:text-github-blue dark:hover:text-github-blue"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Data View Grid / Table */}
      <div className="bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-github-blue animate-spin" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="py-24 text-center">
            <Database className="h-12 w-12 text-github-lightTextMuted dark:text-github-textMuted mx-auto mb-4" />
            <h3 className="text-lg font-bold text-github-lightText dark:text-github-text">No datasets found</h3>
            <p className="text-sm text-github-lightTextMuted dark:text-github-textMuted mt-1">Try resetting your filter parameters or search queries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-github-lightBgSecondary dark:bg-github-bgHeader/30 border-b border-github-lightBorder dark:border-github-border">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-github-lightTextMuted dark:text-github-textMuted">Record ID / Repo</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-github-lightTextMuted dark:text-github-textMuted">Instruction Preview</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-github-lightTextMuted dark:text-github-textMuted">Details</th>
                  {isAdmin && <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-github-lightTextMuted dark:text-github-textMuted">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-github-lightBorder dark:divide-github-border/80">
                {datasets.map((dataset) => (
                  <tr key={dataset._id || dataset.recordId} className="hover:bg-github-lightBgSecondary/40 dark:hover:bg-github-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-github-lightText dark:text-github-text max-w-[200px] truncate" title={dataset.recordId}>
                        {dataset.recordId}
                      </p>
                      <span className="text-xs text-github-lightTextMuted dark:text-github-textMuted truncate max-w-[200px] block" title={dataset.metadata?.repo_name}>
                        {dataset.metadata?.repo_name || 'No Repository'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-github-lightText/90 dark:text-github-text/90 max-w-md truncate">
                        {dataset.instruction}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-github-lightBgSecondary dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightTextMuted dark:text-github-textMuted">
                          {dataset.metadata?.type || 'Unknown'}
                        </span>
                        {dataset.metadata?.source_type && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-github-blue/10 border border-github-blue/20 text-github-blue">
                            {dataset.metadata.source_type}
                          </span>
                        )}
                        {dataset.metadata?.is_readme && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-github-green/10 border border-github-green/20 text-github-green dark:text-github-greenHover">
                            README
                          </span>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(dataset)}
                            className="p-1.5 text-github-lightTextMuted dark:text-github-textMuted hover:text-github-blue dark:hover:text-github-blue hover:bg-github-lightBorder/40 dark:hover:bg-github-border/40 rounded-md transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(dataset)}
                            className="p-1.5 text-github-lightTextMuted dark:text-github-textMuted hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Pagination Footer */}
        {totalPages > 0 && (
          <div className="px-6 py-4 bg-github-lightBgSecondary/40 dark:bg-github-bgHeader/25 border-t border-github-lightBorder dark:border-github-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-github-lightTextMuted dark:text-github-textMuted">
              Showing page <span className="text-github-lightText dark:text-white font-bold">{page}</span> of <span className="text-github-lightText dark:text-white font-bold">{totalPages}</span> ({total} total records)
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-github-lightTextMuted dark:text-github-textMuted">
                <span className="uppercase tracking-wider text-[10px]">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
                  className="px-2.5 py-1 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-md focus:outline-none focus:ring-1 focus:ring-github-blue text-xs font-bold"
                >
                  <option value={10}>10 Records</option>
                  <option value={25}>25 Records</option>
                  <option value={50}>50 Records</option>
                  <option value={100}>100 Records</option>
                </select>
              </div>

              {totalPages > 1 && (
                <div className="inline-flex items-center gap-1.5">
                  <button
                    onClick={() => dispatch(setPage(page - 1))}
                    disabled={page <= 1}
                    className="p-1.5 border border-github-lightBorder dark:border-github-border bg-github-lightBg dark:bg-github-bg hover:bg-github-lightBgSecondary dark:hover:bg-github-bgSecondary text-github-lightText dark:text-github-text disabled:opacity-30 rounded-md transition-all shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch(setPage(page + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 border border-github-lightBorder dark:border-github-border bg-github-lightBg dark:bg-github-bg hover:bg-github-lightBgSecondary dark:hover:bg-github-bgSecondary text-github-lightText dark:text-github-text disabled:opacity-30 rounded-md transition-all shadow-sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Create & Edit Dialog Modal */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040d21]/60 dark:bg-[#040d21]/80 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 md:p-8 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-github-lightBorder dark:border-github-border">
              <h3 className="text-lg font-bold text-github-lightText dark:text-white">
                {isCreateOpen ? 'Create Dataset Record' : 'Edit Dataset Record'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setSelectedDataset(null);
                }}
                className="text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white p-1 bg-github-lightBgSecondary dark:bg-github-bg border border-github-lightBorder dark:border-github-border rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5 uppercase tracking-wide">Record ID</label>
                  <input
                    id="recordId"
                    type="text"
                    disabled={isEditOpen}
                    className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30 disabled:opacity-50"
                    {...formik.getFieldProps('recordId')}
                  />
                  {formik.touched.recordId && formik.errors.recordId && (
                    <span className="text-red-500 text-xs mt-1 block font-bold">{formik.errors.recordId}</span>
                  )}
                </div>

                <div>
                  <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5 uppercase tracking-wide">Metadata Type</label>
                  <input
                    id="metadata.type"
                    type="text"
                    className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                    placeholder="e.g. function_implementation"
                    {...formik.getFieldProps('metadata.type')}
                  />
                  {formik.touched.metadata?.type && formik.errors.metadata?.type && (
                    <span className="text-red-500 text-xs mt-1 block font-bold">{formik.errors.metadata?.type}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5 uppercase tracking-wide">Instruction</label>
                <textarea
                  id="instruction"
                  rows={2}
                  className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                  {...formik.getFieldProps('instruction')}
                />
                {formik.touched.instruction && formik.errors.instruction && (
                  <span className="text-red-500 text-xs mt-1 block font-bold">{formik.errors.instruction}</span>
                )}
              </div>

              <div>
                <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5 uppercase tracking-wide">Input (Optional)</label>
                <textarea
                  id="input"
                  rows={2}
                  className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                  {...formik.getFieldProps('input')}
                />
              </div>

              <div>
                <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5 uppercase tracking-wide">Output / Expected Result</label>
                <textarea
                  id="output"
                  rows={4}
                  className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                  {...formik.getFieldProps('output')}
                />
                {formik.touched.output && formik.errors.output && (
                  <span className="text-red-500 text-xs mt-1 block font-bold">{formik.errors.output}</span>
                )}
              </div>

              <div className="border-t border-github-lightBorder dark:border-github-border pt-4 mt-6">
                <p className="text-xs font-bold text-github-lightText dark:text-white mb-3 uppercase tracking-wide">Optional Metadata Fields</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Repository Name</label>
                    <input
                      id="metadata.repo_name"
                      type="text"
                      className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                      placeholder="e.g. encode/django-rest-framework"
                      {...formik.getFieldProps('metadata.repo_name')}
                    />
                  </div>
                  <div>
                    <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Source Type (Language)</label>
                    <input
                      id="metadata.source_type"
                      type="text"
                      className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                      placeholder="e.g. python"
                      {...formik.getFieldProps('metadata.source_type')}
                    />
                  </div>
                  <div>
                    <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Code Element</label>
                    <input
                      id="metadata.code_element"
                      type="text"
                      className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                      placeholder="e.g. function"
                      {...formik.getFieldProps('metadata.code_element')}
                    />
                  </div>
                  <div>
                    <label className="block text-github-lightTextMuted dark:text-github-textMuted text-xs font-bold mb-1.5">Document Type</label>
                    <input
                      id="metadata.doc_type"
                      type="text"
                      className="w-full px-3 py-2 bg-github-lightBg dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightText dark:text-github-text rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-github-blue focus:ring-github-blue/30"
                      placeholder="e.g. py"
                      {...formik.getFieldProps('metadata.doc_type')}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <input
                    id="metadata.is_readme"
                    type="checkbox"
                    className="h-4 w-4 text-github-blue bg-github-lightBg dark:bg-github-bg border-github-lightBorder dark:border-github-border rounded focus:ring-0 focus:ring-offset-0"
                    checked={formik.values.metadata.is_readme}
                    onChange={(e) => formik.setFieldValue('metadata.is_readme', e.target.checked)}
                  />
                  <label htmlFor="metadata.is_readme" className="text-github-lightText dark:text-github-text text-xs font-bold uppercase tracking-wide cursor-pointer select-none">Contains README Documentation</label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-github-lightBorder dark:border-github-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                    setSelectedDataset(null);
                  }}
                  className="px-4 py-2 border border-github-lightBorder dark:border-github-border bg-github-lightBg dark:bg-github-bg hover:bg-github-lightBgSecondary dark:hover:bg-github-bgSecondary text-github-lightText dark:text-github-text rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-github-green hover:bg-github-greenHover text-white border border-black/15 dark:border-white/10 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Dialog */}
      {isDeleteOpen && selectedDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040d21]/60 dark:bg-[#040d21]/80 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 rounded-xl shadow-2xl">
            <h3 className="text-lg font-bold text-github-lightText dark:text-white mb-2">Delete Dataset Record</h3>
            <p className="text-sm text-github-lightTextMuted dark:text-github-textMuted mb-6 leading-relaxed">
              Are you sure you want to permanently delete record <span className="font-bold text-github-lightText dark:text-github-text font-mono">"{selectedDataset.recordId}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedDataset(null);
                }}
                className="px-4 py-2 border border-github-lightBorder dark:border-github-border bg-github-lightBg dark:bg-github-bg hover:bg-github-lightBgSecondary dark:hover:bg-github-bgSecondary text-github-lightText dark:text-github-text rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white border border-black/15 dark:border-white/10 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Lucky Random Record Modal */}
      {isRandomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040d21]/60 dark:bg-[#040d21]/80 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 md:p-8 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-github-lightBorder dark:border-github-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <h3 className="text-lg font-bold text-github-lightText dark:text-white">Lucky Record Inspector</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(fetchRandomDataset())}
                  disabled={randomLoading}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  {randomLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  Roll Again 🎲
                </button>
                <button
                  onClick={() => {
                    setIsRandomOpen(false);
                  }}
                  className="text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white p-1 bg-github-lightBgSecondary dark:bg-github-bg border border-github-lightBorder dark:border-github-border rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {randomLoading ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-github-blue animate-spin" />
              </div>
            ) : randomDataset ? (
              <div className="space-y-6">
                {/* ID & Repo Panel */}
                <div className="bg-github-lightBgSecondary/50 dark:bg-github-bgHeader/35 p-4 rounded-lg border border-github-lightBorder dark:border-github-border flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wider">Record ID</span>
                    <p className="text-sm font-bold text-github-lightText dark:text-white font-mono">{randomDataset.recordId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wider">Repository</span>
                    <p className="text-sm font-bold text-github-blue hover:underline cursor-pointer">{randomDataset.metadata?.repo_name || 'No Repository'}</p>
                  </div>
                </div>

                {/* Instruction Block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wide">Instruction</span>
                    <button 
                      onClick={() => copyToClipboard(randomDataset.instruction)} 
                      className="p-1.5 hover:bg-github-lightBorder/40 dark:hover:bg-github-border/40 text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white rounded transition-colors"
                      title="Copy Instruction"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3 bg-github-lightBgSecondary dark:bg-github-bgHeader/50 rounded-lg border border-github-lightBorder dark:border-github-border text-sm text-github-lightText dark:text-github-text whitespace-pre-wrap leading-relaxed">
                    {randomDataset.instruction}
                  </div>
                </div>

                {/* Input Block (Optional) */}
                {randomDataset.input && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wide">Input Payload</span>
                      <button 
                        onClick={() => copyToClipboard(randomDataset.input)} 
                        className="p-1.5 hover:bg-github-lightBorder/40 dark:hover:bg-github-border/40 text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white rounded transition-colors"
                        title="Copy Input"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <pre className="p-3 bg-github-lightBgSecondary dark:bg-github-bgHeader/80 font-mono text-xs text-github-lightText dark:text-github-text rounded-lg border border-github-lightBorder dark:border-github-border overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {randomDataset.input}
                    </pre>
                  </div>
                )}

                {/* Output Block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wide">Output / Execution Details</span>
                    <button 
                      onClick={() => copyToClipboard(randomDataset.output)} 
                      className="p-1.5 hover:bg-github-lightBorder/40 dark:hover:bg-github-border/40 text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white rounded transition-colors"
                      title="Copy Output"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <pre className="p-4 bg-github-lightBgSecondary dark:bg-github-bgHeader font-mono text-xs text-github-lightText dark:text-github-text rounded-lg border border-github-lightBorder dark:border-github-border overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {randomDataset.output}
                  </pre>
                </div>

                {/* Metadata tags */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-github-lightBorder dark:border-github-border">
                  <span className="px-2 py-0.5 text-xs font-bold bg-github-lightBgSecondary dark:bg-github-bg border border-github-lightBorder dark:border-github-border text-github-lightTextMuted dark:text-github-textMuted rounded-md">
                    Type: {randomDataset.metadata?.type || 'unknown'}
                  </span>
                  {randomDataset.metadata?.source_type && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-github-blue/10 border border-github-blue/20 text-github-blue rounded-md">
                      Source: {randomDataset.metadata.source_type}
                    </span>
                  )}
                  {randomDataset.metadata?.code_element && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-md">
                      Element: {randomDataset.metadata.code_element}
                    </span>
                  )}
                  {randomDataset.metadata?.is_readme && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-github-green/10 border border-github-green/20 text-github-green dark:text-github-greenHover rounded-md">
                      Documentation File
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-github-lightTextMuted dark:text-github-textMuted py-10">Failed to load a random record. Try rolling again.</p>
            )}
          </div>
        </div>
      )}

      {/* 8. Bulk Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040d21]/60 dark:bg-[#040d21]/80 backdrop-blur-[2px]">
          <div className="w-full max-w-xl bg-github-lightBg dark:bg-github-bgSecondary border border-github-lightBorder dark:border-github-border p-6 md:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-github-lightBorder dark:border-github-border">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-github-blue" />
                <h3 className="text-lg font-bold text-github-lightText dark:text-white">Bulk Ingestion Portal</h3>
              </div>
              <button
                onClick={() => {
                  setIsImportOpen(false);
                  setImportFile(null);
                  setImportData([]);
                  setImportErrors([]);
                }}
                className="text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white p-1 bg-github-lightBgSecondary dark:bg-github-bg border border-github-lightBorder dark:border-github-border rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Drag and drop zone */}
              {!importFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-github-blue bg-github-blue/5' 
                      : 'border-github-lightBorder dark:border-github-border hover:border-github-blue/50 dark:hover:border-github-blue/50 bg-github-lightBgSecondary/30 dark:bg-github-bgHeader/10'
                  }`}
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="h-10 w-10 text-github-lightTextMuted dark:text-github-textMuted mx-auto mb-3" />
                  <p className="text-sm font-bold text-github-lightText dark:text-github-text">Drag & drop your JSON file here</p>
                  <p className="text-xs text-github-lightTextMuted dark:text-github-textMuted mt-1.5">or click to browse from directory files</p>
                  <span className="inline-block mt-3 text-[10px] uppercase tracking-wider font-bold bg-github-lightBgSecondary dark:bg-github-bg border border-github-lightBorder dark:border-github-border/80 text-github-lightTextMuted dark:text-github-textMuted px-2.5 py-0.5 rounded-md">
                    JSON files up to 10MB
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Metadata Info */}
                  <div className="flex items-center justify-between p-3 bg-github-lightBgSecondary dark:bg-github-bgHeader border border-github-lightBorder dark:border-github-border rounded-lg">
                    <div className="truncate pr-4">
                      <p className="text-sm font-bold text-github-lightText dark:text-white truncate">{importFile.name}</p>
                      <span className="text-xs text-github-lightTextMuted dark:text-github-textMuted">{(importFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button
                      onClick={() => {
                        setImportFile(null);
                        setImportData([]);
                        setImportErrors([]);
                      }}
                      className="p-1 hover:bg-red-500/10 hover:text-red-500 text-github-lightTextMuted dark:text-github-textMuted rounded-md transition-colors"
                      title="Clear File"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Diagnostic stats grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-github-lightBgSecondary dark:bg-github-bgHeader border border-github-lightBorder dark:border-github-border rounded-lg text-center">
                      <span className="text-[10px] font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wider block">Parsed</span>
                      <span className="text-lg font-extrabold text-github-lightText dark:text-white mt-0.5 block">
                        {importData.length + importErrors.length}
                      </span>
                    </div>
                    <div className="p-3 bg-github-green/5 dark:bg-github-green/10 border border-github-green/20 dark:border-github-green/20 rounded-lg text-center">
                      <span className="text-[10px] font-bold text-github-green dark:text-github-greenHover uppercase tracking-wider block">Valid</span>
                      <span className="text-lg font-extrabold text-github-green dark:text-github-greenHover mt-0.5 block">
                        {importData.length}
                      </span>
                    </div>
                    <div className={`p-3 border rounded-lg text-center ${
                      importErrors.length > 0
                        ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/20 dark:border-red-500/20'
                        : 'bg-github-lightBgSecondary dark:bg-github-bgHeader border-github-lightBorder dark:border-github-border'
                    }`}>
                      <span className="text-[10px] font-bold text-github-lightTextMuted dark:text-github-textMuted uppercase tracking-wider block">Errors</span>
                      <span className={`text-lg font-extrabold mt-0.5 block ${importErrors.length > 0 ? 'text-red-500' : 'text-github-lightText dark:text-white'}`}>
                        {importErrors.length}
                      </span>
                    </div>
                  </div>

                  {/* Parsing Warnings / Diagnostics list */}
                  {importErrors.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Incomplete/Invalid Records Detected</span>
                      </div>
                      <div className="p-3 max-h-36 overflow-y-auto bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 text-red-500 dark:text-red-400 rounded-lg space-y-1 font-mono text-[11px] leading-normal">
                        {importErrors.slice(0, 30).map((err, i) => (
                          <div key={i}>{err}</div>
                        ))}
                        {importErrors.length > 30 && (
                          <div className="font-bold text-[10px] text-github-lightTextMuted dark:text-github-textMuted pt-1 border-t border-red-500/10">
                            ... and {importErrors.length - 30} other validation errors.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {importData.length > 0 && importErrors.length === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-github-green/5 dark:bg-github-green/10 border border-github-green/20 text-github-green dark:text-github-greenHover rounded-lg text-xs font-bold">
                      <CheckSquare className="h-4 w-4" />
                      All records verified. Ready to ingest into catalog database index.
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-github-lightBorder dark:border-github-border pt-4">
                <button
                  onClick={() => {
                    setIsImportOpen(false);
                    setImportFile(null);
                    setImportData([]);
                    setImportErrors([]);
                  }}
                  className="px-4 py-2 border border-github-lightBorder dark:border-github-border bg-github-lightBg dark:bg-github-bg hover:bg-github-lightBgSecondary dark:hover:bg-github-bgSecondary text-github-lightText dark:text-github-text rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitImport}
                  disabled={importData.length === 0 || importLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-github-green hover:bg-github-greenHover disabled:opacity-50 text-white border border-black/15 dark:border-white/10 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  {importLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Confirm Ingest ({importData.length} records)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataListing;
