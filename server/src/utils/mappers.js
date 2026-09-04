export function toOpportunityDTO(row) {
  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    organization: row.organization,
    category: row.category,
    website: row.website,
    applicationUrl: row.application_url,
    status: row.status,
    priority: row.priority,
    deadline: row.deadline,
    appliedAt: row.applied_at,
    interview: row.interview || { scheduled: false },
    salary: row.salary,
    location: row.location,
    skills: row.skills || [],
    notes: row.notes,
    followUpDate: row.follow_up_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromOpportunityInput(data) {
  const row = {};
  if ("title" in data) row.title = data.title;
  if ("organization" in data) row.organization = data.organization;
  if ("category" in data) row.category = data.category;
  if ("website" in data) row.website = data.website;
  if ("applicationUrl" in data) row.application_url = data.applicationUrl;
  if ("status" in data) row.status = data.status;
  if ("priority" in data) row.priority = data.priority;
  if ("deadline" in data) row.deadline = data.deadline;
  if ("appliedAt" in data) row.applied_at = data.appliedAt;
  if ("interview" in data) row.interview = data.interview;
  if ("salary" in data) row.salary = data.salary;
  if ("location" in data) row.location = data.location;
  if ("skills" in data) row.skills = data.skills;
  if ("notes" in data) row.notes = data.notes;
  if ("followUpDate" in data) row.follow_up_date = data.followUpDate;
  return row;
}

export function toTaskDTO(row) {
  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    linkedOpportunityId: row.linked_opportunity_id,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromTaskInput(data) {
  const row = {};
  if ("title" in data) row.title = data.title;
  if ("description" in data) row.description = data.description;
  if ("dueDate" in data) row.due_date = data.dueDate;
  if ("priority" in data) row.priority = data.priority;
  if ("status" in data) row.status = data.status;
  if ("linkedOpportunityId" in data) row.linked_opportunity_id = data.linkedOpportunityId;
  if ("tags" in data) row.tags = data.tags;
  return row;
}

export function toNoteDTO(row) {
  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    tags: row.tags || [],
    linkedOpportunityId: row.linked_opportunity_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromNoteInput(data) {
  const row = {};
  if ("title" in data) row.title = data.title;
  if ("content" in data) row.content = data.content;
  if ("tags" in data) row.tags = data.tags;
  if ("linkedOpportunityId" in data) row.linked_opportunity_id = data.linkedOpportunityId;
  return row;
}
