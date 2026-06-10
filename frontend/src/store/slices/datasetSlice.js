import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch paginated, sorted, and filtered datasets
export const fetchDatasets = createAsyncThunk(
  'dataset/fetchDatasets',
  async (queryParams, { rejectWithValue }) => {
    try {
      // Map queries cleanly
      const response = await api.get('/datasets', { params: queryParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create dataset
export const createDataset = createAsyncThunk(
  'dataset/createDataset',
  async (datasetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/datasets', datasetData);
      return response.data.data.dataset;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update dataset
export const updateDataset = createAsyncThunk(
  'dataset/updateDataset',
  async ({ id, datasetData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/datasets/${id}`, datasetData);
      return response.data.data.dataset;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete dataset
export const deleteDataset = createAsyncThunk(
  'dataset/deleteDataset',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/datasets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch MongoDB Analytics aggregates
export const fetchAnalytics = createAsyncThunk(
  'dataset/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const [overview, repoDist, langMetrics] = await Promise.all([
        api.get('/analytics/stats/overview'),
        api.get('/analytics/stats/repository-distribution'),
        api.get('/analytics/stats/language-metrics'),
      ]);

      return {
        overview: overview.data.data.stats,
        repoDistribution: repoDist.data.data.stats,
        languageMetrics: langMetrics.data.data.stats,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Bulk import datasets
export const bulkImportDatasets = createAsyncThunk(
  'dataset/bulkImportDatasets',
  async (records, { rejectWithValue }) => {
    try {
      const response = await api.post('/analytics/bulk-import', { records });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch random dataset
export const fetchRandomDataset = createAsyncThunk(
  'dataset/fetchRandomDataset',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/datasets/random');
      return response.data.data.dataset;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch extended analytics aggregates
export const fetchExtendedAnalytics = createAsyncThunk(
  'dataset/fetchExtendedAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const [typeAnalysis, repoAnalysis, codeAnalysis, docAnalysis, frameworkAnalysis, aiAnalysis, mlAnalysis] = await Promise.all([
        api.get('/analytics/datasets/type-analysis'),
        api.get('/analytics/datasets/repo-analysis'),
        api.get('/analytics/datasets/code-analysis'),
        api.get('/analytics/datasets/doc-analysis'),
        api.get('/analytics/datasets/framework-analysis'),
        api.get('/analytics/datasets/ai-analysis'),
        api.get('/analytics/datasets/ml-analysis')
      ]);

      return {
        typeAnalysis: typeAnalysis.data.data.stats,
        repoAnalysis: repoAnalysis.data.data.stats,
        codeAnalysis: codeAnalysis.data.data.stats,
        docAnalysis: docAnalysis.data.data.stats,
        frameworkAnalysis: frameworkAnalysis.data.data.stats,
        aiCount: aiAnalysis.data.data.aiRecordCount,
        mlCount: mlAnalysis.data.data.mlRecordCount
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  datasets: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null,
  
  // Random dataset state
  randomDataset: null,
  randomLoading: false,
  importLoading: false,
  
  // Analytics Cache
  analytics: {
    overview: null,
    repoDistribution: [],
    languageMetrics: [],
    loading: false,
    error: null,
  },

  // Extended Analytics Cache
  extendedAnalytics: {
    typeAnalysis: [],
    repoAnalysis: [],
    codeAnalysis: [],
    docAnalysis: [],
    frameworkAnalysis: [],
    aiCount: 0,
    mlCount: 0,
    loading: false,
    error: null,
  },
  
  // Active query parameters state
  filters: {
    type: '',
    repo: '',
    language: '',
    search: '',
    sort: '-createdAt',
  }
};

const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // reset page when filters change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Datasets
      .addCase(fetchDatasets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasets.fulfilled, (state, action) => {
        state.loading = false;
        state.datasets = action.payload.data.datasets;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
        state.totalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchDatasets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Dataset
      .addCase(createDataset.fulfilled, (state, action) => {
        state.datasets = [action.payload, ...state.datasets];
        state.total += 1;
      })
      // Update Dataset
      .addCase(updateDataset.fulfilled, (state, action) => {
        state.datasets = state.datasets.map((d) => 
          d._id === action.payload._id || d.recordId === action.payload.recordId ? action.payload : d
        );
      })
      // Delete Dataset
      .addCase(deleteDataset.fulfilled, (state, action) => {
        state.datasets = state.datasets.filter((d) => d._id !== action.payload && d.recordId !== action.payload);
        state.total -= 1;
      })
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.overview = action.payload.overview;
        state.analytics.repoDistribution = action.payload.repoDistribution;
        state.analytics.languageMetrics = action.payload.languageMetrics;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload;
      })
      // Bulk Import Datasets
      .addCase(bulkImportDatasets.pending, (state) => {
        state.importLoading = true;
      })
      .addCase(bulkImportDatasets.fulfilled, (state) => {
        state.importLoading = false;
      })
      .addCase(bulkImportDatasets.rejected, (state) => {
        state.importLoading = false;
      })
      // Fetch Random Dataset
      .addCase(fetchRandomDataset.pending, (state) => {
        state.randomLoading = true;
        state.randomDataset = null;
      })
      .addCase(fetchRandomDataset.fulfilled, (state, action) => {
        state.randomLoading = false;
        state.randomDataset = action.payload;
      })
      .addCase(fetchRandomDataset.rejected, (state) => {
        state.randomLoading = false;
      })
      // Fetch Extended Analytics
      .addCase(fetchExtendedAnalytics.pending, (state) => {
        state.extendedAnalytics.loading = true;
        state.extendedAnalytics.error = null;
      })
      .addCase(fetchExtendedAnalytics.fulfilled, (state, action) => {
        state.extendedAnalytics.loading = false;
        state.extendedAnalytics.typeAnalysis = action.payload.typeAnalysis;
        state.extendedAnalytics.repoAnalysis = action.payload.repoAnalysis;
        state.extendedAnalytics.codeAnalysis = action.payload.codeAnalysis;
        state.extendedAnalytics.docAnalysis = action.payload.docAnalysis;
        state.extendedAnalytics.frameworkAnalysis = action.payload.frameworkAnalysis;
        state.extendedAnalytics.aiCount = action.payload.aiCount;
        state.extendedAnalytics.mlCount = action.payload.mlCount;
      })
      .addCase(fetchExtendedAnalytics.rejected, (state, action) => {
        state.extendedAnalytics.loading = false;
        state.extendedAnalytics.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, setPage, setLimit } = datasetSlice.actions;
export default datasetSlice.reducer;
