import {
  EventRepository,
  OptionRepository,
} from "../repositories/index.repository.js";

class EventService {
  constructor() {
    this.eventRepository = new EventRepository();
    this.optionRepository = new OptionRepository();
  }

  async createEvent(data) {
    try {
      const event = await this.eventRepository.create(data);
      return event;
    } catch (error) {
      throw error;
    }
  }

  async getEvent(id) {
    try {
      const event = await this.eventRepository.get(id);
      return event;
    } catch (error) {
      throw error;
    }
  }

  async getAllEvents(filters, paginationOptions) {
    try {
      return await this.eventRepository.getAll(filters, paginationOptions);
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(id, data) {
    try {
      const event = await this.eventRepository.update(id, data);
      return event;
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(id) {
    try {
      const result = await this.eventRepository.destroy(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateEventStatus(id, status) {
    try {
      const event = await this.eventRepository.updateEventStatus(id, status);
      return event;
    } catch (error) {
      throw error;
    }
  }

  async createOption(data) {
    try {
      const option = await this.optionRepository.create(data);
      return option;
    } catch (error) {
      throw error;
    }
  }

  async setOptionResult(id, result) {
    try {
      const option = await this.optionRepository.setOptionResult(id, result);
      return option;
    } catch (error) {
      throw error;
    }
  }
}

export default EventService;
