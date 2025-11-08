import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,

  IconButton,
  Alert,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { Project } from '@/types';
import { projectService } from '@/services/projectService';

interface ProjectEditPageProps {
  onProjectUpdated?: (project: Project) => void;
}

interface FormData {
  name: string;
  description: string;
  language: string;
  languageCode: string;
  assignedUsers: string[];
}

interface FormErrors {
  [key: string]: string;
}

const languageOptions = [
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
];

export const ProjectEditPage: React.FC<ProjectEditPageProps> = ({
  onProjectUpdated,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    language: '',
    languageCode: '',
    assignedUsers: [],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Load project data on mount
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('No project ID provided');
        setLoadingProject(false);
        return;
      }

      try {
        console.log('🔄 PROJECT EDIT: Loading project data for ID:', projectId);
        
        // Try to get project from location state first
        const stateProject = location.state?.project;
        if (stateProject) {
          console.log('📋 PROJECT EDIT: Using project from navigation state');
          setProject(stateProject);
          setFormData({
            name: stateProject.name || stateProject.title || '',
            description: stateProject.description || '',
            language: stateProject.language || '',
            languageCode: stateProject.languageCode || '',
            assignedUsers: stateProject.assignedUsers || [],
          });
        } else {
          // Fetch from API
          console.log('🔄 PROJECT EDIT: Fetching project from API...');
          const response = await projectService.getProject(projectId);
          
          if (response.success && response.data) {
            const projectData = response.data.project || response.data;
            console.log('✅ PROJECT EDIT: Project loaded from API:', projectData);
            
            setProject(projectData);
            setFormData({
              name: projectData.name || projectData.title || '',
              description: projectData.description || '',
              language: projectData.language || '',
              languageCode: projectData.languageCode || '',
              assignedUsers: projectData.assignedUsers || [],
            });
          } else {
            setError(response.error || 'Failed to load project');
          }
        }
      } catch (error: any) {
        console.error('❌ PROJECT EDIT: Error loading project:', error);
        setError('Failed to load project data');
      } finally {
        setLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId, location.state]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    const language = languageOptions.find(lang => lang.code === languageCode);
    setFormData(prev => ({
      ...prev,
      language: language?.name || '',
      languageCode: languageCode,
    }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    }

    if (!formData.language || !formData.languageCode) {
      errors.language = 'Please select a language';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !projectId) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('💾 PROJECT EDIT: Starting project update...');
      console.log('📋 PROJECT EDIT: Form data:', formData);

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        language: formData.language,
        languageCode: formData.languageCode,
        assignedUsers: formData.assignedUsers,
      };

      const response = await projectService.updateProject(projectId, updateData);

      if (response.success) {
        console.log('✅ PROJECT EDIT: Project updated successfully');
        setSuccess('Project updated successfully!');
        
        // Call callback if provided
        if (onProjectUpdated && response.data) {
          onProjectUpdated(response.data);
        }

        // Navigate back to project detail page after a short delay
        setTimeout(() => {
          navigate(`/projects/${projectId}`, {
            state: { message: 'Project updated successfully' }
          });
        }, 1500);
      } else {
        console.error('❌ PROJECT EDIT: Update failed:', response.error);
        setError(response.error || 'Failed to update project');
      }
    } catch (error: any) {
      console.error('❌ PROJECT EDIT: Update error:', error);
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Loading project data...</Typography>
        </Box>
      </Container>
    );
  }

  if (!project && !loadingProject) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Project not found'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={() => navigate(`/projects/${projectId}`)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Edit Project
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Update your project settings and information
        </Typography>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Edit Form */}
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Project Information
        </Typography>

        <Grid container spacing={3}>
          {/* Project Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              placeholder="Enter a descriptive project name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Project Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Project Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!formErrors.description}
              helperText={formErrors.description}
              placeholder="Describe the project objectives and requirements"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Language Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!formErrors.language}>
              <InputLabel>Target Language</InputLabel>
              <Select
                value={formData.languageCode}
                label="Target Language"
                onChange={(e) => handleLanguageChange(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <LanguageIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Select a language</em>
                </MenuItem>
                {languageOptions.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.language && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {formErrors.language}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Language Code Display */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Language Code"
              value={formData.languageCode}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/projects/${projectId}`)}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};