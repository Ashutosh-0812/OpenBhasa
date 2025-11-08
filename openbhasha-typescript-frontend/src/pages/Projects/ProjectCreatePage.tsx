import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Language as LanguageIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Project, Task, TaskType, User } from '@/types';
import { ProjectStatus, Prompt } from '@/types/project';

import { userService } from '@/services/userService';
import { TaskData } from '@/services/taskService';



interface ProjectCreatePageProps {
  onProjectCreated?: (project: Project) => void;
}

interface FormData {
  name: string;
  description: string;
  language: string;
  languageCode: string;
  status: ProjectStatus;
  dueDate: string;
  assignedUsers: string[];
  tasks: Partial<Task>[];
}

interface FormErrors {
  [key: string]: string;
}

const INDIAN_LANGUAGES = [
  { name: 'Hindi', code: 'hi' },
  { name: 'English', code: 'en' },
  { name: 'Bengali', code: 'bn' },
  { name: 'Telugu', code: 'te' },
  { name: 'Marathi', code: 'mr' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Urdu', code: 'ur' },
  { name: 'Gujarati', code: 'gu' },
  { name: 'Malayalam', code: 'ml' },
  { name: 'Kannada', code: 'kn' },
  { name: 'Odia', code: 'or' },
  { name: 'Punjabi', code: 'pa' },
  { name: 'Assamese', code: 'as' },
  { name: 'Nepali', code: 'ne' },
  { name: 'Sanskrit', code: 'sa' },
];

const TASK_TYPES: { value: TaskType; label: string; description: string }[] = [
  {
    value: 'read-only',
    label: 'Read-Only',
    description: 'Participants read provided text prompts',
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Interactive conversation with prompts',
  },
  {
    value: 'continuous',
    label: 'Continuous Speech',
    description: 'Free-form continuous speaking tasks',
  },
];

const steps = ['Project Details', 'Task Configuration', 'Review & Create'];

export const ProjectCreatePage: React.FC<ProjectCreatePageProps> = ({
  onProjectCreated,
}) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    language: '',
    languageCode: '',
    status: 'draft',
    dueDate: '',
    assignedUsers: [],
    tasks: [],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Load available users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        console.log('👥 PROJECT CREATE: Loading users...');
        const response = await userService.getAllUsers();
        
        if (response.success && response.data) {
          const users = response.data.users || response.data || [];
          console.log('✅ PROJECT CREATE: Users loaded:', users);
          setAvailableUsers(users);
        } else {
          console.error('❌ PROJECT CREATE: Failed to load users:', response.error);
          setAvailableUsers([]);
        }
      } catch (error: any) {
        console.error('❌ PROJECT CREATE: User loading error:', error);
        setAvailableUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    loadUsers();
  }, []);

  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};

    if (step === 0) {
      // Project Details validation
      if (!formData.name.trim()) {
        errors.name = 'Project name is required';
      }
      if (!formData.description.trim()) {
        errors.description = 'Project description is required';
      }
      if (!formData.language) {
        errors.language = 'Language selection is required';
      }
    } else if (step === 1) {
      // Task Configuration validation
      if (formData.tasks.length === 0) {
        errors.tasks = 'At least one task is required';
      }
      formData.tasks.forEach((task, index) => {
        if (!task.title?.trim()) {
          errors[`task_${index}_title`] = 'Task title is required';
        }
        if (!task.type) {
          errors[`task_${index}_type`] = 'Task type is required';
        }
        if (!task.prompts || task.prompts.length === 0) {
          errors[`task_${index}_prompts`] = 'At least one prompt is required';
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[] | Partial<Task>[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleLanguageChange = (languageName: string) => {
    const selectedLang = INDIAN_LANGUAGES.find(lang => lang.name === languageName);
    if (selectedLang) {
      setFormData(prev => ({
        ...prev,
        language: selectedLang.name,
        languageCode: selectedLang.code,
      }));
    }
  };

  const addTask = () => {
    const newTask: Partial<Task> = {
      title: '',
      type: 'read-only',
      description: '',
      prompts: [],
      assignedTo: [],
      status: 'not-started',
      estimatedDuration: 5,
    };
    
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
      ),
    }));
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const addPromptToTask = (taskIndex: number) => {
    const newPrompt: Prompt = {
      id: `prompt_${Date.now()}`,
      taskId: '',
      text: '',
      order: (formData.tasks[taskIndex].prompts?.length || 0) + 1,
      type: formData.tasks[taskIndex].type || 'read-only',
      language: formData.language,
    };

    const updatedTask = {
      ...formData.tasks[taskIndex],
      prompts: [...(formData.tasks[taskIndex].prompts || []), newPrompt],
    };

    updateTask(taskIndex, 'prompts', updatedTask.prompts);
  };

  const updatePrompt = (taskIndex: number, promptIndex: number, text: string) => {
    const updatedPrompts = [...(formData.tasks[taskIndex].prompts || [])];
    updatedPrompts[promptIndex] = {
      ...updatedPrompts[promptIndex],
      text,
    };
    updateTask(taskIndex, 'prompts', updatedPrompts);
  };

  const removePrompt = (taskIndex: number, promptIndex: number) => {
    const updatedPrompts = (formData.tasks[taskIndex].prompts || []).filter(
      (_, i) => i !== promptIndex
    );
    updateTask(taskIndex, 'prompts', updatedPrompts);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    console.log('🚀 FORM: Starting project creation submission');
    console.log('📋 FORM: Form Data:', JSON.stringify(formData, null, 2));

    setLoading(true);
    setError('');

    try {
      // Import projectService
      const { projectService } = await import('@/services/projectService');
      
      // Prepare project data for API
      const projectData = {
        name: formData.name,
        description: formData.description,
        language: formData.language,
        languageCode: formData.languageCode,
        totalTasks: formData.tasks.length,
        assignedUsers: formData.assignedUsers,
        // Map additional fields to backend format
        title: formData.name, // Backend expects 'title'
        dialects: [], // Add if needed
        targetRecordings: formData.tasks.length || 10,
        guidelines: formData.description,
        tags: [],
        assignedReviewers: []
      };

      console.log('📡 FORM: Calling projectService.createProject');
      const response = await projectService.createProject(projectData);
      
      console.log('📥 FORM: Response received:', response);

      if (response.success && response.data) {
        console.log('✅ FORM: Project created successfully');
        const createdProject = response.data.project;
        
        // Create tasks for the project if any are defined
        if (formData.tasks.length > 0) {
          console.log('📋 FORM: Creating tasks for project...');
          const { taskService } = await import('@/services/taskService');
          
          for (const task of formData.tasks) {
            try {
              const taskData: TaskData = {
                project: createdProject.id || createdProject._id,
                title: task.title || 'Untitled Task',
                description: task.description || '',
                script: task.prompts?.map(p => p.text).join('\n') || '',
                language: formData.language,
                difficulty: 'medium',
                estimatedDuration: task.estimatedDuration || 60,
                targetRecordings: 10,
                tags: [],
                priority: 'medium'
              };
              
              console.log('📝 FORM: Creating task:', task.title);
              const taskResponse = await taskService.createTask(taskData);
              
              if (taskResponse.success) {
                console.log('✅ FORM: Task created successfully:', task.title);
              } else {
                console.error('❌ FORM: Task creation failed:', task.title, taskResponse.error);
              }
            } catch (taskError) {
              console.error('❌ FORM: Task creation exception:', taskError);
            }
          }
        }
        
        onProjectCreated?.(createdProject);
        navigate('/projects', { 
          state: { 
            message: `Project "${formData.name}" created successfully with ${formData.tasks.length} tasks!` 
          }
        });
      } else {
        console.error('❌ FORM: Project creation failed:', response.error);
        setError(response.error || 'Failed to create project. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ FORM: Exception during project creation:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProjectDetails = () => (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          fontWeight: 600,
          mb: 3,
        }}
      >
        Project Information
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                borderRadius: { xs: 2, sm: 1.5 },
                fontSize: { xs: '16px', sm: '14px' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TaskIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Project Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!formErrors.description}
            helperText={formErrors.description}
            placeholder="Describe the project objectives and requirements"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 2, sm: 1.5 },
                fontSize: { xs: '16px', sm: '14px' },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl 
            fullWidth 
            error={!!formErrors.language}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 2, sm: 1.5 },
                fontSize: { xs: '16px', sm: '14px' },
              },
            }}
          >
            <InputLabel>Language</InputLabel>
            <Select
              value={formData.language}
              label="Language"
              onChange={(e) => handleLanguageChange(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <LanguageIcon color="action" />
                </InputAdornment>
              }
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <MenuItem key={lang.code} value={lang.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{lang.name}</Typography>
                    <Chip
                      label={lang.code.toUpperCase()}
                      size="small"
                      sx={{ fontSize: '0.75rem', height: 20 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Due Date (Optional)"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 2, sm: 1.5 },
                fontSize: { xs: '16px', sm: '14px' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ScheduleIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Assign Users (Optional)</InputLabel>
            <Select
              multiple
              value={formData.assignedUsers}
              onChange={(e) => handleInputChange('assignedUsers', e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const user = availableUsers.find(u => (u.id || (u as any)._id) === userId);
                    return (
                      <Chip
                        key={userId}
                        label={user?.name || userId}
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      />
                    );
                  })}
                </Box>
              )}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 2, sm: 1.5 },
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            >
              {loadingUsers ? (
                <MenuItem disabled>Loading users...</MenuItem>
              ) : availableUsers.map((user) => (
                <MenuItem key={user.id || (user as any)._id} value={user.id || (user as any)._id}>
                  <Box>
                    <Typography variant="body2">{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email} • {user.role}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Project Status</InputLabel>
            <Select
              value={formData.status}
              label="Project Status"
              onChange={(e) => handleInputChange('status', e.target.value as ProjectStatus)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 2, sm: 1.5 },
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTaskConfiguration = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            fontWeight: 600,
          }}
        >
          Task Configuration
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addTask}
          sx={{
            borderRadius: { xs: 2, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minHeight: { xs: 40, sm: 'auto' },
          }}
        >
          Add Task
        </Button>
      </Box>

      {formErrors.tasks && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formErrors.tasks}
        </Alert>
      )}

      {formData.tasks.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'background.default',
            borderRadius: { xs: 2, sm: 2 },
          }}
        >
          <TaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Tasks Created
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create tasks to organize your project content
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addTask}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            Create Your First Task
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {formData.tasks.map((task, taskIndex) => (
            <Card
              key={taskIndex}
              sx={{
                borderRadius: { xs: 2, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                    }}
                  >
                    Task {taskIndex + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeTask(taskIndex)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Task Title"
                      value={task.title || ''}
                      onChange={(e) => updateTask(taskIndex, 'title', e.target.value)}
                      error={!!formErrors[`task_${taskIndex}_title`]}
                      helperText={formErrors[`task_${taskIndex}_title`]}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: 2, sm: 1.5 },
                          fontSize: { xs: '16px', sm: '14px' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth error={!!formErrors[`task_${taskIndex}_type`]}>
                      <InputLabel>Task Type</InputLabel>
                      <Select
                        value={task.type || 'read-only'}
                        label="Task Type"
                        onChange={(e) => updateTask(taskIndex, 'type', e.target.value as TaskType)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 2, sm: 1.5 },
                            fontSize: { xs: '16px', sm: '14px' },
                          },
                        }}
                      >
                        {TASK_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box>
                              <Typography variant="body2">{type.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {type.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Task Description (Optional)"
                      value={task.description || ''}
                      onChange={(e) => updateTask(taskIndex, 'description', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: 2, sm: 1.5 },
                          fontSize: { xs: '16px', sm: '14px' },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Estimated Duration (minutes)"
                      value={task.estimatedDuration || 5}
                      onChange={(e) => updateTask(taskIndex, 'estimatedDuration', Number(e.target.value))}
                      InputProps={{
                        inputProps: { min: 1, max: 60 },
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScheduleIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: 2, sm: 1.5 },
                          fontSize: { xs: '16px', sm: '14px' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Prompts Section */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      Prompts ({task.prompts?.length || 0})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addPromptToTask(taskIndex)}
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minHeight: { xs: 32, sm: 'auto' },
                      }}
                    >
                      Add Prompt
                    </Button>
                  </Box>

                  {formErrors[`task_${taskIndex}_prompts`] && (
                    <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
                      {formErrors[`task_${taskIndex}_prompts`]}
                    </Alert>
                  )}

                  {(!task.prompts || task.prompts.length === 0) ? (
                    <Box
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: 'background.default',
                        borderRadius: 1,
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        No prompts added. Add prompts for participants to record.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {task.prompts.map((prompt, promptIndex) => (
                        <Box
                          key={promptIndex}
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'flex-start',
                          }}
                        >
                          <TextField
                            fullWidth
                            size="small"
                            label={`Prompt ${promptIndex + 1}`}
                            value={prompt.text}
                            onChange={(e) => updatePrompt(taskIndex, promptIndex, e.target.value)}
                            multiline
                            rows={2}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 1 },
                                fontSize: { xs: '14px', sm: '14px' },
                              },
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removePrompt(taskIndex, promptIndex)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderReview = () => (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          fontWeight: 600,
          mb: 3,
        }}
      >
        Review & Create Project
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                📋 Project Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formData.name || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Language
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formData.language || 'Not selected'}
                    </Typography>
                    {formData.languageCode && (
                      <Chip
                        label={formData.languageCode.toUpperCase()}
                        size="small"
                        sx={{ fontSize: '0.75rem', height: 20 }}
                      />
                    )}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    size="small"
                    color={formData.status === 'active' ? 'success' : 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                {formData.dueDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(formData.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Tasks
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formData.tasks.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                🎯 Task Overview
              </Typography>
              
              {formData.tasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tasks created yet
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {formData.tasks.map((task, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        backgroundColor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        {index + 1}. {task.title || 'Untitled Task'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={task.type || 'read-only'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          label={`${task.prompts?.length || 0} prompts`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          label={`${task.estimatedDuration || 5} min`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {formData.assignedUsers.length > 0 && (
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: { xs: 2, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  👥 Assigned Users ({formData.assignedUsers.length})
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.assignedUsers.map((userId) => {
                    const user = availableUsers.find(u => (u.id || (u as any)._id) === userId);
                    return user ? (
                      <Chip
                        key={userId}
                        label={`${user.name} (${user.role})`}
                        size="small"
                        sx={{ fontSize: '0.875rem' }}
                      />
                    ) : null;
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderProjectDetails();
      case 1:
        return renderTaskConfiguration();
      case 2:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/projects')}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.default' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create New Project
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Set up a new project with tasks and prompts
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Progress Stepper */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 4 },
          borderRadius: { xs: 2, sm: 2 },
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stepper
          activeStep={activeStep}
          sx={{
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, mb: 4 }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: '60vh',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {getStepContent(activeStep)}
        </Paper>
      </Box>

      {/* Navigation Buttons */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, sm: 2 },
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              minHeight: { xs: 44, sm: 'auto' },
              fontSize: { xs: '1rem', sm: '1rem' },
            }}
          >
            Back
          </Button>

          <Box sx={{ flex: 1, mx: 2 }}>
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / steps.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
              }}
            />
          </Box>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? undefined : <SaveIcon />}
              sx={{
                minHeight: { xs: 44, sm: 'auto' },
                fontSize: { xs: '1rem', sm: '1rem' },
                fontWeight: 600,
                px: { xs: 3, sm: 4 },
                background: loading
                  ? 'rgba(102, 126, 234, 0.6)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: loading
                    ? 'rgba(102, 126, 234, 0.6)'
                    : 'linear-gradient(135deg, #5a67d8 0%, #667eea 100%)',
                },
              }}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                minHeight: { xs: 44, sm: 'auto' },
                fontSize: { xs: '1rem', sm: '1rem' },
                fontWeight: 600,
                px: { xs: 3, sm: 4 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #667eea 100%)',
                },
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};